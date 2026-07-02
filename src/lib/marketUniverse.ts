export type UniverseEntry = { ticker: string; sector: string };

export const MARKET_UNIVERSE: UniverseEntry[] = [
  // Technology
  { ticker: "AAPL", sector: "科技" },
  { ticker: "MSFT", sector: "科技" },
  { ticker: "NVDA", sector: "科技" },
  { ticker: "AVGO", sector: "科技" },
  { ticker: "ORCL", sector: "科技" },
  { ticker: "CRM", sector: "科技" },
  { ticker: "ADBE", sector: "科技" },
  { ticker: "AMD", sector: "科技" },
  { ticker: "CSCO", sector: "科技" },
  { ticker: "IBM", sector: "科技" },
  { ticker: "INTC", sector: "科技" },
  { ticker: "TXN", sector: "科技" },
  { ticker: "QCOM", sector: "科技" },
  { ticker: "TSM", sector: "科技" },
  // Communication Services
  { ticker: "GOOGL", sector: "通訊服務" },
  { ticker: "META", sector: "通訊服務" },
  { ticker: "NFLX", sector: "通訊服務" },
  { ticker: "DIS", sector: "通訊服務" },
  { ticker: "TMUS", sector: "通訊服務" },
  { ticker: "VZ", sector: "通訊服務" },
  { ticker: "T", sector: "通訊服務" },
  // Consumer Discretionary
  { ticker: "AMZN", sector: "非必需消費" },
  { ticker: "TSLA", sector: "非必需消費" },
  { ticker: "HD", sector: "非必需消費" },
  { ticker: "MCD", sector: "非必需消費" },
  { ticker: "NKE", sector: "非必需消費" },
  { ticker: "SBUX", sector: "非必需消費" },
  { ticker: "LOW", sector: "非必需消費" },
  { ticker: "BKNG", sector: "非必需消費" },
  // Consumer Staples
  { ticker: "WMT", sector: "必需消費" },
  { ticker: "PG", sector: "必需消費" },
  { ticker: "KO", sector: "必需消費" },
  { ticker: "PEP", sector: "必需消費" },
  { ticker: "COST", sector: "必需消費" },
  { ticker: "PM", sector: "必需消費" },
  // Financials
  { ticker: "JPM", sector: "金融" },
  { ticker: "V", sector: "金融" },
  { ticker: "MA", sector: "金融" },
  { ticker: "BAC", sector: "金融" },
  { ticker: "WFC", sector: "金融" },
  { ticker: "GS", sector: "金融" },
  { ticker: "MS", sector: "金融" },
  { ticker: "AXP", sector: "金融" },
  { ticker: "BLK", sector: "金融" },
  // Healthcare
  { ticker: "LLY", sector: "醫療保健" },
  { ticker: "UNH", sector: "醫療保健" },
  { ticker: "JNJ", sector: "醫療保健" },
  { ticker: "ABBV", sector: "醫療保健" },
  { ticker: "MRK", sector: "醫療保健" },
  { ticker: "PFE", sector: "醫療保健" },
  { ticker: "TMO", sector: "醫療保健" },
  { ticker: "ABT", sector: "醫療保健" },
  // Industrials
  { ticker: "CAT", sector: "工業" },
  { ticker: "BA", sector: "工業" },
  { ticker: "HON", sector: "工業" },
  { ticker: "UPS", sector: "工業" },
  { ticker: "RTX", sector: "工業" },
  { ticker: "GE", sector: "工業" },
  { ticker: "DE", sector: "工業" },
  { ticker: "LMT", sector: "工業" },
  // Energy
  { ticker: "XOM", sector: "能源" },
  { ticker: "CVX", sector: "能源" },
  { ticker: "COP", sector: "能源" },
  { ticker: "SLB", sector: "能源" },
  // Materials
  { ticker: "LIN", sector: "原材料" },
  { ticker: "SHW", sector: "原材料" },
  { ticker: "APD", sector: "原材料" },
  // Utilities
  { ticker: "NEE", sector: "公用事業" },
  { ticker: "DUK", sector: "公用事業" },
  { ticker: "SO", sector: "公用事業" },
  // Real Estate
  { ticker: "AMT", sector: "房地產" },
  { ticker: "PLD", sector: "房地產" },
  { ticker: "EQIX", sector: "房地產" },
];

export function sectorOf(ticker: string): string | undefined {
  return MARKET_UNIVERSE.find((e) => e.ticker === ticker.toUpperCase())?.sector;
}
