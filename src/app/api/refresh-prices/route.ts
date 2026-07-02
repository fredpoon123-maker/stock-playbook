import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchQuote, fetchBeta, fetchPeerAveragePE, fetchDailyHistory } from "@/lib/fmp";

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
      const [quote, beta, peerAvgPE] = await Promise.all([
        fetchQuote(stock.ticker),
        fetchBeta(stock.ticker),
        fetchPeerAveragePE(stock.ticker),
      ]);

      await prisma.priceCache.upsert({
        where: { stockId: stock.id },
        create: {
          stockId: stock.id,
          ticker: stock.ticker,
          price: quote?.price ?? null,
          changePercent: quote?.changePercent ?? null,
          peRatio: quote?.peRatio ?? null,
          marketCap: quote?.marketCap ?? null,
          beta,
          peerAvgPE,
        },
        update: {
          price: quote?.price ?? null,
          changePercent: quote?.changePercent ?? null,
          peRatio: quote?.peRatio ?? null,
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

  return NextResponse.json({ refreshed: results.length, results });
}
