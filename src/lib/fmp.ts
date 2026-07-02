const BASE_URL = "https://financialmodelingprep.com/stable";

type FmpQuote = {
  symbol: string;
  price?: number;
  pe?: number;
  marketCap?: number;
};

type FmpProfile = {
  symbol: string;
  beta?: number;
};

type FmpPeers = {
  symbol: string;
  peersList?: string[];
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
    peRatio: quote.pe ?? null,
    marketCap: quote.marketCap ?? null,
  };
}

export async function fetchBeta(ticker: string) {
  const data = await fmpGet<FmpProfile[]>("/profile", { symbol: ticker });
  return data?.[0]?.beta ?? null;
}

export async function fetchPeers(ticker: string): Promise<string[]> {
  const data = await fmpGet<FmpPeers[]>("/stock-peers", { symbol: ticker });
  return data?.[0]?.peersList ?? [];
}

export async function fetchPeerAveragePE(ticker: string): Promise<number | null> {
  const peers = await fetchPeers(ticker);
  if (peers.length === 0) return null;

  const peValues: number[] = [];
  for (const peer of peers.slice(0, 8)) {
    const quote = await fetchQuote(peer);
    if (quote?.peRatio != null && Number.isFinite(quote.peRatio)) {
      peValues.push(quote.peRatio);
    }
  }
  if (peValues.length === 0) return null;
  return peValues.reduce((a, b) => a + b, 0) / peValues.length;
}
