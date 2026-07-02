export function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  const digits = n < 10 ? 2 : n < 100 ? 1 : 0;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 })}`;
}

export function fmtMarketCap(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-HK", { year: "numeric", month: "short", day: "numeric" });
}
