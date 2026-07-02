import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchIntraday, type Bar } from "@/lib/fmp";
import { toDailyCandles, toWeeklyCandles, toMonthlyCandles, toYearlyCandles, toLinePoints } from "@/lib/chart";

export const dynamic = "force-dynamic";

const RANGES = ["intraday", "5d", "1D", "1W", "1M", "1Y"] as const;
type Range = (typeof RANGES)[number];

export async function GET(request: Request, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "1D") as Range;

  if (!RANGES.includes(range)) {
    return NextResponse.json({ error: "invalid range" }, { status: 400 });
  }

  if (range === "intraday" || range === "5d") {
    const bars = await fetchIntraday(ticker, range === "intraday" ? "5min" : "30min");
    const cutoffDates = uniqueDates(bars).slice(-(range === "intraday" ? 1 : 5));
    const filtered: Bar[] = bars.filter((b) => cutoffDates.includes(b.date.slice(0, 10)));
    return NextResponse.json({ type: "line", points: toLinePoints(filtered) });
  }

  const dailyBars = await prisma.priceBar.findMany({
    where: { ticker },
    orderBy: { date: "asc" },
  });
  const bars: Bar[] = dailyBars.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume ?? undefined,
  }));

  let candles;
  switch (range) {
    case "1D":
      candles = toDailyCandles(bars.slice(-180));
      break;
    case "1W":
      candles = toWeeklyCandles(bars);
      break;
    case "1M":
      candles = toMonthlyCandles(bars);
      break;
    case "1Y":
      candles = toYearlyCandles(bars);
      break;
  }

  return NextResponse.json({ type: "candle", candles });
}

function uniqueDates(bars: Bar[]): string[] {
  const set = new Set(bars.map((b) => b.date.slice(0, 10)));
  return Array.from(set).sort();
}
