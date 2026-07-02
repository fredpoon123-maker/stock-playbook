import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchQuote,
  fetchBeta,
  fetchPERatio,
  fetchPeerAveragePE,
  fetchDailyHistory,
  fetchGeneralNews,
  fetchStockNews,
  fetchEconomicCalendar,
} from "@/lib/fmp";
import { MARKET_UNIVERSE } from "@/lib/marketUniverse";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function syncPriceBars(ticker: string) {
  const existing = await prisma.priceBar.count({ where: { ticker } });
  const bars = existing === 0
    ? await fetchDailyHistory(ticker) // bootstrap: full history
    : await fetchDailyHistory(ticker, isoDaysAgo(15)); // top up recent window

  if (bars.length === 0) return;

  await prisma.$transaction(
    bars.map((b) =>
      prisma.priceBar.upsert({
        where: { ticker_date: { ticker, date: new Date(b.date) } },
        create: {
          ticker,
          date: new Date(b.date),
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
          volume: b.volume ?? null,
        },
        update: {
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
          volume: b.volume ?? null,
        },
      }),
    ),
  );
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function syncMarketSnapshot() {
  const quotes = await Promise.all(
    MARKET_UNIVERSE.map(async (entry) => ({
      entry,
      quote: await fetchQuote(entry.ticker),
    })),
  );

  const rows = quotes.filter((q) => q.quote != null);
  if (rows.length === 0) return;

  await prisma.$transaction(
    rows.map(({ entry, quote }) =>
      prisma.marketSnapshot.upsert({
        where: { ticker: entry.ticker },
        create: {
          ticker: entry.ticker,
          sector: entry.sector,
          price: quote!.price,
          changePercent: quote!.changePercent,
          marketCap: quote!.marketCap,
        },
        update: {
          sector: entry.sector,
          price: quote!.price,
          changePercent: quote!.changePercent,
          marketCap: quote!.marketCap,
          fetchedAt: new Date(),
        },
      }),
    ),
  );
}

async function syncNews(tickers: string[]) {
  const [general, stockNewsLists] = await Promise.all([
    fetchGeneralNews(20),
    Promise.all(tickers.map(async (t) => ({ ticker: t, articles: await fetchStockNews(t, 5) }))),
  ]);

  const rows: { kind: string; ticker: string | null; title: string; url: string; source: string | null; publishedAt: Date }[] = [];
  for (const a of general) {
    rows.push({ kind: "GENERAL", ticker: null, title: a.title, url: a.url, source: a.source, publishedAt: new Date(a.publishedDate) });
  }
  for (const { ticker, articles } of stockNewsLists) {
    for (const a of articles) {
      rows.push({ kind: "STOCK", ticker, title: a.title, url: a.url, source: a.source, publishedAt: new Date(a.publishedDate) });
    }
  }
  if (rows.length === 0) return;

  await prisma.$transaction(
    rows.map((r) =>
      prisma.newsItem.upsert({
        where: { url_kind: { url: r.url, kind: r.kind } },
        create: r,
        update: { title: r.title, source: r.source, publishedAt: r.publishedAt },
      }),
    ),
  );
}

async function syncEconomicCalendar() {
  const from = new Date().toISOString().slice(0, 10);
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 14);
  const to = toDate.toISOString().slice(0, 10);

  const events = await fetchEconomicCalendar(from, to);
  if (events.length === 0) return;

  await prisma.$transaction(
    events.slice(0, 100).map((e) => {
      const country = e.country ?? "";
      return prisma.economicEvent.upsert({
        where: { event_country_date: { event: e.event, country, date: new Date(e.date) } },
        create: {
          event: e.event,
          country,
          date: new Date(e.date),
          impact: e.impact,
          actual: e.actual,
          forecast: e.forecast,
          previous: e.previous,
        },
        update: {
          impact: e.impact,
          actual: e.actual,
          forecast: e.forecast,
          previous: e.previous,
          fetchedAt: new Date(),
        },
      });
    }),
  );
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const stocks = await prisma.stock.findMany({ select: { id: true, ticker: true } });
  const results: { ticker: string; ok: boolean; error?: string }[] = [];

  for (const stock of stocks) {
    try {
      const [quote, beta, peRatio, peerAvgPE] = await Promise.all([
        fetchQuote(stock.ticker),
        fetchBeta(stock.ticker),
        fetchPERatio(stock.ticker),
        fetchPeerAveragePE(stock.ticker),
      ]);

      await prisma.priceCache.upsert({
        where: { stockId: stock.id },
        create: {
          stockId: stock.id,
          ticker: stock.ticker,
          price: quote?.price ?? null,
          changePercent: quote?.changePercent ?? null,
          peRatio,
          marketCap: quote?.marketCap ?? null,
          beta,
          peerAvgPE,
        },
        update: {
          price: quote?.price ?? null,
          changePercent: quote?.changePercent ?? null,
          peRatio,
          marketCap: quote?.marketCap ?? null,
          beta,
          peerAvgPE,
          fetchedAt: new Date(),
        },
      });

      await syncPriceBars(stock.ticker);

      results.push({ ticker: stock.ticker, ok: true });
    } catch (err) {
      results.push({
        ticker: stock.ticker,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  let snapshotOk = true;
  try {
    await syncMarketSnapshot();
  } catch {
    snapshotOk = false;
  }

  let newsOk = true;
  try {
    await syncNews(stocks.map((s) => s.ticker));
  } catch {
    newsOk = false;
  }

  let calendarOk = true;
  try {
    await syncEconomicCalendar();
  } catch {
    calendarOk = false;
  }

  return NextResponse.json({ refreshed: results.length, results, snapshotOk, newsOk, calendarOk });
}
