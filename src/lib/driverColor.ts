const PALETTE = [
  "var(--blue)",
  "var(--purple)",
  "var(--teal)",
  "var(--amber)",
  "var(--green)",
  "var(--accent)",
  "#7a8aa0",
  "#c0322b",
];

export function driverColor(driver: string): string {
  let hash = 0;
  for (let i = 0; i < driver.length; i++) {
    hash = (hash * 31 + driver.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
