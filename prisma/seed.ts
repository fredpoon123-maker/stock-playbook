import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stocks = [
  {
    ticker: "NVDA",
    name: "NVIDIA",
    driver: "AI GPU/運算",
    industry: "半導體",
    conviction: "HIGH" as const,
    positionSize: "LARGE" as const,
    status: "ACCUMULATE" as const,
    synopsis: "AI運算龍頭，數據中心GPU市佔近乎壟斷，Blackwell出貨持續加速。",
    entryTiers: JSON.stringify({ first: 120, add: 105, heavy: 90 }),
    catalysts: JSON.stringify(["Blackwell Ultra出貨爬坡", "主權AI/新客戶訂單", "下季data center營收指引"]),
    risks: JSON.stringify(["估值已反映高增長預期", "出口管制風險", "客戶自研晶片分流"]),
    nextEarnings: new Date("2026-08-20"),
    saQuantRating: "Strong Buy",
    saFactorGrades: JSON.stringify({ valuation: "D", growth: "A+", profitability: "A+", momentum: "B", revisions: "A" }),
    saAuthorRating: "Buy",
  },
  {
    ticker: "TSM",
    name: "台積電",
    driver: "AI晶圓代工",
    industry: "半導體",
    conviction: "HIGH" as const,
    positionSize: "LARGE" as const,
    status: "ACCUMULATE" as const,
    synopsis: "先進製程獨家代工龍頭，CoWoS產能為AI晶片出貨瓶頸關鍵。",
    entryTiers: JSON.stringify({ first: 190, add: 170, heavy: 150 }),
    catalysts: JSON.stringify(["2nm量產爬坡", "CoWoS產能擴充", "月營收公布"]),
    risks: JSON.stringify(["地緣政治風險", "資本支出上升壓縮短期利潤率"]),
    nextEarnings: new Date("2026-07-16"),
    saQuantRating: "Buy",
    saFactorGrades: JSON.stringify({ valuation: "C", growth: "A", profitability: "A+", momentum: "B+", revisions: "A" }),
    saAuthorRating: "Strong Buy",
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    driver: "AI軟件/平台",
    industry: "軟件",
    conviction: "HIGH" as const,
    positionSize: "LARGE" as const,
    status: "HOLD" as const,
    synopsis: "Azure AI服務同Copilot生態帶動雲業務加速，企業滲透率持續提升。",
    entryTiers: JSON.stringify({ first: 420, add: 380, heavy: 340 }),
    catalysts: JSON.stringify(["Azure增速回升", "Copilot付費滲透率提升"]),
    risks: JSON.stringify(["AI資本支出回報週期存疑", "雲端競爭加劇"]),
    nextEarnings: new Date("2026-07-28"),
    saQuantRating: "Buy",
    saFactorGrades: JSON.stringify({ valuation: "D+", growth: "B+", profitability: "A", momentum: "B", revisions: "B+" }),
    saAuthorRating: "Buy",
  },
  {
    ticker: "AVGO",
    name: "Broadcom",
    driver: "AI ASIC/網絡",
    industry: "半導體",
    conviction: "MED" as const,
    positionSize: "MEDIUM" as const,
    status: "ACCUMULATE" as const,
    synopsis: "客製化AI加速器(ASIC)同網絡晶片受惠雲端大廠自研晶片趨勢。",
    entryTiers: JSON.stringify({ first: 250, add: 220, heavy: 190 }),
    catalysts: JSON.stringify(["新雲端客戶ASIC訂單", "VMware整合綜效持續兌現"]),
    risks: JSON.stringify(["客戶集中度高", "估值已計入高增長"]),
    nextEarnings: new Date("2026-09-10"),
    saQuantRating: "Buy",
    saFactorGrades: JSON.stringify({ valuation: "D", growth: "A", profitability: "A", momentum: "B+", revisions: "A-" }),
    saAuthorRating: "Buy",
  },
  {
    ticker: "INTC",
    name: "Intel",
    driver: "半導體/晶圓代工轉型",
    industry: "半導體",
    conviction: "LOW" as const,
    positionSize: "SMALL" as const,
    status: "HOLD" as const,
    synopsis: "代工業務轉型仍在早期，18A製程能否吸引外部客戶為關鍵觀察點。",
    entryTiers: JSON.stringify({ first: 22, add: 18, heavy: 14 }),
    catalysts: JSON.stringify(["18A外部客戶簽約", "政府補貼/夥伴資金到位"]),
    risks: JSON.stringify(["執行風險高", "市佔持續流失予AMD/ARM陣營"]),
    nextEarnings: new Date("2026-07-24"),
    saQuantRating: "Hold",
    saFactorGrades: JSON.stringify({ valuation: "B", growth: "D", profitability: "D+", momentum: "C", revisions: "C-" }),
    saAuthorRating: "Hold",
  },
  {
    ticker: "SNDK",
    name: "SanDisk",
    driver: "記憶體",
    industry: "半導體",
    conviction: "LOW" as const,
    positionSize: "SMALL" as const,
    status: "AVOID" as const,
    synopsis: "NAND記憶體週期性強，現階段供需狀況同定價能力仍待觀察。",
    entryTiers: JSON.stringify({ first: null, add: null, heavy: null }),
    catalysts: JSON.stringify(["NAND現貨價回升"]),
    risks: JSON.stringify(["產業週期底部未明", "定價能力弱"]),
    nextEarnings: new Date("2026-08-05"),
    saQuantRating: "Sell",
    saFactorGrades: JSON.stringify({ valuation: "A", growth: "D-", profitability: "C", momentum: "D", revisions: "D" }),
    saAuthorRating: "Hold",
  },
];

async function main() {
  for (const s of stocks) {
    await prisma.stock.upsert({
      where: { ticker: s.ticker },
      update: s,
      create: s,
    });
  }
  console.log(`Seeded ${stocks.length} stocks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
