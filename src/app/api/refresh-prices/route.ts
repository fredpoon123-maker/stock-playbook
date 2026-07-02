import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchQuote, fetchBeta, fetchPeerAveragePE } from "@/lib/fmp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
          peRatio: quote?.peRatio ?? null,
          marketCap: quote?.marketCap ?? null,
          beta,
          peerAvgPE,
        },
        update: {
          price: quote?.price ?? null,
          peRatio: quote?.peRatio ?? null,
          marketCap: quote?.marketCap ?? null,
          beta,
          peerAvgPE,
          fetchedAt: new Date(),
        },
      });

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
