import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchQuote,
  fetchBeta,
  fetchPERatio,
  fetchPeerAveragePE,
  fetchDailyHistory,
  fetchBiggestGainers,
  fetchBiggestLosers,
  fetchMostActive,
  type MoverQuote,
} from "@/lib/fmp";

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

async function syncMarketMovers() {
  const [gainers, losers, actives] = await Promise.all([
    fetchBiggestGainers(),
    fetchBiggestLosers(),
    fetchMostActive(),
  ]);

  const categories: { category: string; quotes: MoverQuote[] }[] = [
    { category: "GAINER", quotes: gainers },
    { category: "LOSER", quotes: losers },
    { category: "ACTIVE", quotes: actives },
  ];

  for (const { category, quotes } of categories) {
    if (quotes.length === 0) continue;
    await prisma.marketMover.deleteMany({ where: { category } });
    await prisma.marketMover.createMany({
      data: quotes.map((q) => ({
        ticker: q.ticker,
        name: q.name,
        price: q.price,
        changePercent: q.changePercent,
        exchange: q.exchange,
        category,
      })),
    });
  }
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

  let moversOk = true;
  try {
    await syncMarketMovers();
  } catch {
    moversOk = false;
  }

  return NextResponse.json({ refreshed: results.length, results, moversOk });
}
