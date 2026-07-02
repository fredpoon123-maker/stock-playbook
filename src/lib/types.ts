export type EntryTiers = {
  first: number | null;
  add: number | null;
  heavy: number | null;
};

export type FactorGrades = {
  valuation?: string;
  growth?: string;
  profitability?: string;
  momentum?: string;
  revisions?: string;
};

export const CONVICTION_LABEL: Record<string, string> = {
  HIGH: "High",
  MED: "Med",
  LOW: "Low",
};

export const POSITION_LABEL: Record<string, string> = {
  LARGE: "大注",
  MEDIUM: "中注",
  SMALL: "細注",
};

export const STATUS_LABEL: Record<string, { emoji: string; label: string }> = {
  ACCUMULATE: { emoji: "🟢", label: "Accumulate" },
  HOLD: { emoji: "🟡", label: "Hold / Watch" },
  AVOID: { emoji: "🔴", label: "Avoid" },
};

export function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export type StockView = {
  id: string;
  ticker: string;
  name: string;
  driver: string;
  industry: string | null;
  conviction: string;
  positionSize: string;
  status: string;
  synopsis: string | null;
  entryTiers: EntryTiers;
  catalysts: string[];
  risks: string[];
  nextEarnings: string | null;
  price: number | null;
  changePercent: number | null;
  marketCap: number | null;
  beta: number | null;
  peRatio: number | null;
  peerAvgPE: number | null;
};
