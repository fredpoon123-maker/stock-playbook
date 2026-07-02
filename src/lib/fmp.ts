const BASE_URL = "https://financialmodelingprep.com/stable";

type FmpQuote = {
  symbol: string;
  price?: number;
  marketCap?: number;
  changePercentage?: number;
};

type FmpRatiosTtm = {
  symbol: string;
  priceToEarningsRatioTTM?: number;
};

export type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type FmpEodBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type FmpIntradayBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type FmpProfile = {
  symbol: string;
  beta?: number;
};

type FmpPeer = {
  symbol: string;
};

function apiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set");
  return key;
}

async function fmpGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("apikey", apiKey());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function fetchQuote(ticker: string) {
  const data = await fmpGet<FmpQuote[]>("/quote", { symbol: ticker });
  const quote = data?.[0];
  if (!quote) return null;
  return {
    price: quote.price ?? null,
    marketCap: quote.marketCap ?? null,
    changePercent: quote.changePercentage ?? null,
  };
}

export async function fetchPERatio(ticker: string): Promise<number | null> {
  const data = await fmpGet<FmpRatiosTtm[]>("/ratios-ttm", { symbol: ticker });
  return data?.[0]?.priceToEarningsRatioTTM ?? null;
}

export async function fetchDailyHistory(
  ticker: string,
  from?: string,
  to?: string,
): Promise<Bar[]> {
  const params: Record<string, string> = { symbol: ticker };
  if (from) params.from = from;
  if (to) params.to = to;
  const data = await fmpGet<FmpEodBar[]>("/historical-price-eod/full", params);
  if (!data) return [];
  return data
    .map((b) => ({
      date: b.date,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchIntraday(
  ticker: string,
  interval: "5min" | "30min",
): Promise<Bar[]> {
  const data = await fmpGet<FmpIntradayBar[]>(`/historical-chart/${interval}`, { symbol: ticker });
  if (!data) return [];
  return data
    .map((b) => ({
      date: b.date,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export type NewsArticle = {
  title: string;
  url: string;
  source: string | null;
  publishedDate: string;
};

type FmpNews = {
  title?: string;
  url?: string;
  publisher?: string;
  site?: string;
  publishedDate?: string;
  date?: string;
};

function mapNews(data: FmpNews[] | null): NewsArticle[] {
  if (!data) return [];
  return data
    .filter((n) => n.title && n.url)
    .map((n) => ({
      title: n.title!,
      url: n.url!,
      source: n.publisher ?? n.site ?? null,
      publishedDate: n.publishedDate ?? n.date ?? new Date().toISOString(),
    }));
}

export async function fetchGeneralNews(limit = 20): Promise<NewsArticle[]> {
  return mapNews(await fmpGet<FmpNews[]>("/news/general-latest", { limit: String(limit) }));
}

export async function fetchStockNews(ticker: string, limit = 5): Promise<NewsArticle[]> {
  return mapNews(await fmpGet<FmpNews[]>("/news/stock", { symbols: ticker, limit: String(limit) }));
}

export type EconomicEventData = {
  event: string;
  country: string | null;
  date: string;
  impact: string | null;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
};

type FmpEconomicEvent = {
  event?: string;
  country?: string;
  date?: string;
  impact?: string;
  actual?: number | string | null;
  estimate?: number | string | null;
  previous?: number | string | null;
};

export async function fetchEconomicCalendar(from: string, to: string): Promise<EconomicEventData[]> {
  const data = await fmpGet<FmpEconomicEvent[]>("/economic-calendar", { from, to });
  if (!data) return [];
  return data
    .filter((e) => e.event && e.date)
    .map((e) => ({
      event: e.event!,
      country: e.country ?? null,
      date: e.date!,
      impact: e.impact ?? null,
      actual: e.actual != null ? String(e.actual) : null,
      forecast: e.estimate != null ? String(e.estimate) : null,
      previous: e.previous != null ? String(e.previous) : null,
    }));
}

export async function fetchBeta(ticker: string) {
  const data = await fmpGet<FmpProfile[]>("/profile", { symbol: ticker });
  return data?.[0]?.beta ?? null;
}

export async function fetchPeers(ticker: string): Promise<string[]> {
  const data = await fmpGet<FmpPeer[]>("/stock-peers", { symbol: ticker });
  return (data ?? []).map((p) => p.symbol).filter(Boolean);
}

export async function fetchPeerAveragePE(ticker: string): Promise<number | null> {
  const peers = await fetchPeers(ticker);
  if (peers.length === 0) return null;

  const ratios = await Promise.all(peers.slice(0, 8).map((peer) => fetchPERatio(peer)));
  const peValues = ratios.filter((r): r is number => r != null && Number.isFinite(r));
  if (peValues.length === 0) return null;
  return peValues.reduce((a, b) => a + b, 0) / peValues.length;
}
