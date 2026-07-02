import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StockGrid } from "@/components/StockGrid";
import { SummaryTable } from "@/components/SummaryTable";
import { PriceHeatmap, type MoverView } from "@/components/PriceHeatmap";
import { RefreshButton } from "@/components/RefreshButton";
import { driverColor } from "@/lib/driverColor";
import { parseJSON, type EntryTiers, type StockView } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stocks, moverRows] = await Promise.all([
    prisma.stock.findMany({
      include: { priceCache: true },
      orderBy: { ticker: "asc" },
    }),
    prisma.marketMover.findMany(),
  ]);

  const movers: MoverView[] = moverRows.map((m) => ({
    ticker: m.ticker,
    name: m.name,
    changePercent: m.changePercent,
    category: m.category as MoverView["category"],
  }));

  const total = stocks.length;

  const driverCounts = new Map<string, number>();
  for (const stock of stocks) {
    driverCounts.set(stock.driver, (driverCounts.get(stock.driver) ?? 0) + 1);
  }
  const driverBreakdown = Array.from(driverCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([driver, count]) => ({
      driver,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }));
  const top = driverBreakdown[0];

  const view: StockView[] = stocks.map((s) => ({
    id: s.id,
    ticker: s.ticker,
    name: s.name,
    driver: s.driver,
    industry: s.industry,
    conviction: s.conviction,
    positionSize: s.positionSize,
    status: s.status,
    synopsis: s.synopsis,
    entryTiers: parseJSON<EntryTiers>(s.entryTiers, { first: null, add: null, heavy: null }),
    catalysts: parseJSON<string[]>(s.catalysts, []),
    risks: parseJSON<string[]>(s.risks, []),
    nextEarnings: s.nextEarnings ? s.nextEarnings.toISOString() : null,
    price: s.priceCache?.price ?? null,
    changePercent: s.priceCache?.changePercent ?? null,
    marketCap: s.priceCache?.marketCap ?? null,
    beta: s.priceCache?.beta ?? null,
    peRatio: s.priceCache?.peRatio ?? null,
    peerAvgPE: s.priceCache?.peerAvgPE ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <RefreshButton />
        <Link href="/stock/new" className="pb-fbtn active" style={{ textDecoration: "none" }}>
          + 新增股票
        </Link>
      </div>

      <h2 className="pb-section">🔥 Heatmap</h2>
      <PriceHeatmap stocks={view} movers={movers} />

      {total === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          未有股票資料，請先加入。
        </p>
      ) : (
        <>
          <h2 className="pb-section">⚠️ 驅動因子集中度</h2>
          <div className="pb-concbox">
            <div className="pb-conc-title">你押咗幾多喺同一個驅動因子？（按持股數目，{total} 隻中）</div>
            <div className="pb-conc-sub">分散應該睇「驅動因子」而唔係 ticker 數目。同一因子 = 會一齊升跌。</div>
            {driverBreakdown.map((d) => (
              <div className="pb-bar" key={d.driver}>
                <span className="pb-nm">{d.driver}</span>
                <div className="pb-track">
                  <div className="pb-fill" style={{ width: `${Math.max(d.pct, 6)}%`, background: driverColor(d.driver) }}>
                    {d.count} 隻 · {d.pct.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
            {top && top.pct > 50 && (
              <div className="pb-warn">
                ⚠️ <b>集中度警告</b>：「{top.driver}」佔 <b>{top.pct.toFixed(0)}%</b>（{top.count}/{total} 隻）。考慮補返其他非相關驅動因子分散風險。
              </div>
            )}
          </div>

          <div className="pb-legend">
            <span className="pb-badge pb-b-buy">🟢 Accumulate</span>
            <span className="pb-badge pb-b-hold">🟡 Hold / Watch</span>
            <span className="pb-badge pb-b-avoid">🔴 Avoid</span>
            <span style={{ color: "var(--muted)" }}>
              信念：<b className="pb-conv-h">High</b> / <b className="pb-conv-m">Med</b> / <b className="pb-conv-l">Low</b>
            </span>
          </div>

          <h2 className="pb-section">📊 總覽</h2>
          <SummaryTable stocks={view} />

          <h2 className="pb-section">🗂 個股詳情</h2>
          <StockGrid stocks={view} />
        </>
      )}
    </div>
  );
}
