import type { Bar } from "@/lib/fmp";

export type Candle = { time: string; open: number; high: number; low: number; close: number };
export type LinePoint = { time: string; value: number };

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function aggregate(bars: Bar[], keyFn: (date: Date) => string): Candle[] {
  const groups = new Map<string, Bar[]>();
  for (const bar of bars) {
    const key = keyFn(new Date(bar.date));
    const list = groups.get(key) ?? [];
    list.push(bar);
    groups.set(key, list);
  }

  const candles: Candle[] = [];
  for (const [, group] of groups) {
    group.sort((a, b) => a.date.localeCompare(b.date));
    const open = group[0].open;
    const close = group[group.length - 1].close;
    const high = Math.max(...group.map((b) => b.high));
    const low = Math.min(...group.map((b) => b.low));
    candles.push({ time: group[group.length - 1].date.slice(0, 10), open, high, low, close });
  }
  return candles.sort((a, b) => a.time.localeCompare(b.time));
}

export function toDailyCandles(bars: Bar[]): Candle[] {
  return bars.map((b) => ({ time: b.date.slice(0, 10), open: b.open, high: b.high, low: b.low, close: b.close }));
}

export function toWeeklyCandles(bars: Bar[]): Candle[] {
  return aggregate(bars, isoWeekKey);
}

export function toMonthlyCandles(bars: Bar[]): Candle[] {
  return aggregate(bars, (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
}

export function toYearlyCandles(bars: Bar[]): Candle[] {
  return aggregate(bars, (d) => `${d.getFullYear()}`);
}

export function toLinePoints(bars: Bar[]): LinePoint[] {
  return bars.map((b) => ({ time: b.date, value: b.close }));
}
