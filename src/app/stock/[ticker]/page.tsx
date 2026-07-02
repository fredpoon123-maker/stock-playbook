import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PEBadge } from "@/components/PEBadge";
import { StockTrendChart } from "@/components/StockTrendChart";
import {
  CONVICTION_LABEL,
  POSITION_LABEL,
  STATUS_LABEL,
  parseJSON,
  type EntryTiers,
  type FactorGrades,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  const stock = await prisma.stock.findUnique({
    where: { ticker: ticker.toUpperCase() },
    include: { priceCache: true, trades: { orderBy: { date: "desc" } } },
  });

  if (!stock) notFound();

  const status = STATUS_LABEL[stock.status];
  const entryTiers = parseJSON<EntryTiers>(stock.entryTiers, {
    first: null,
    add: null,
    heavy: null,
  });
  const catalysts = parseJSON<string[]>(stock.catalysts, []);
  const risks = parseJSON<string[]>(stock.risks, []);
  const factorGrades = parseJSON<FactorGrades>(stock.saFactorGrades, {});

  return (
    <div className="flex flex-col gap-5">
      <div className="pb-card" style={{ cursor: "default" }}>
        <div className="pb-top">
          <div>
            <h3>
              {stock.ticker}{" "}
              <span className={`pb-pill ${status.emoji === "🟢" ? "pb-b-buy" : status.emoji === "🟡" ? "pb-b-hold" : "pb-b-avoid"}`}>
                {status.emoji}
              </span>
            </h3>
            <div className="pb-tname">
              {stock.name} — {status.label}
            </div>
          </div>
          <div className="pb-px">
            <div className="pb-p">
              {stock.priceCache?.price != null ? `$${stock.priceCache.price.toFixed(2)}` : "未刷新"}
            </div>
            <div className="pb-m">
              {stock.priceCache?.marketCap != null ? `$${(stock.priceCache.marketCap / 1e9).toFixed(1)}B` : ""}
              {stock.priceCache?.beta != null ? ` · β${stock.priceCache.beta.toFixed(2)}` : ""}
            </div>
          </div>
        </div>
        <div className="pb-strip">
          <div>
            <div className="pb-k">信念</div>
            <div className={`pb-v ${stock.conviction === "HIGH" ? "pb-conv-h" : stock.conviction === "MED" ? "pb-conv-m" : "pb-conv-l"}`}>
              {CONVICTION_LABEL[stock.conviction]}
            </div>
          </div>
          <div>
            <div className="pb-k">注碼</div>
            <div className="pb-v">{POSITION_LABEL[stock.positionSize]}</div>
          </div>
          <div>
            <div className="pb-k">驅動</div>
            <div className="pb-v">{stock.driver}</div>
          </div>
        </div>
      </div>

      <Link
        href={`/stock/${stock.ticker}/edit`}
        className="pb-fbtn active self-start"
        style={{ textDecoration: "none" }}
      >
        編輯
      </Link>

      <StockTrendChart ticker={stock.ticker} />

      {stock.synopsis && (
        <section className="pb-panel">
          <h2 className="pb-section" style={{ margin: 0 }}>簡介</h2>
          <p className="mt-2 text-sm">{stock.synopsis}</p>
        </section>
      )}

      <section className="pb-panel">
        <h2 className="pb-section" style={{ margin: 0 }}>估值 / PE比較</h2>
        <div className="mt-2">
          <PEBadge
            peRatio={stock.priceCache?.peRatio}
            peerAvgPE={stock.priceCache?.peerAvgPE}
          />
        </div>
      </section>

      <section className="pb-panel">
        <h2 className="pb-section" style={{ margin: 0 }}>買入框架</h2>
        <div className="pb-entries mt-3">
          <div className="pb-entry">
            <div className="pb-e1">第一注</div>
            <div className="pb-e2">{entryTiers.first != null ? `$${entryTiers.first.toFixed(2)}` : "—"}</div>
          </div>
          <div className="pb-entry">
            <div className="pb-e1">加注</div>
            <div className="pb-e2">{entryTiers.add != null ? `$${entryTiers.add.toFixed(2)}` : "—"}</div>
          </div>
          <div className="pb-entry">
            <div className="pb-e1">重注</div>
            <div className="pb-e2">{entryTiers.heavy != null ? `$${entryTiers.heavy.toFixed(2)}` : "—"}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="pb-panel">
          <h2 className="pb-section" style={{ margin: 0 }}>催化劑</h2>
          <ul className="pb-mini mt-2">
            {catalysts.length === 0 && <li style={{ listStyle: "none", marginLeft: "-15px", color: "var(--muted)" }}>—</li>}
            {catalysts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
        <section className="pb-panel">
          <h2 className="pb-section" style={{ margin: 0 }}>風險 ⚠️</h2>
          <ul className="pb-mini mt-2">
            {risks.length === 0 && <li style={{ listStyle: "none", marginLeft: "-15px", color: "var(--muted)" }}>—</li>}
            {risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="pb-panel">
        <h2 className="pb-section" style={{ margin: 0 }}>
          Seeking Alpha Premium資料（手動輸入）
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Stat label="Quant Rating" value={stock.saQuantRating || "—"} />
          <Stat label="Author Rating" value={stock.saAuthorRating || "—"} />
          <Stat label="Valuation Grade" value={factorGrades.valuation || "—"} />
          <Stat label="Growth Grade" value={factorGrades.growth || "—"} />
          <Stat label="Profitability" value={factorGrades.profitability || "—"} />
          <Stat label="Momentum" value={factorGrades.momentum || "—"} />
          <Stat label="Revisions" value={factorGrades.revisions || "—"} />
        </div>
      </section>

      {stock.nextEarnings && (
        <div className="pb-earn">
          📅 下次業績 <span className="pb-nd">{new Date(stock.nextEarnings).toLocaleDateString("zh-HK")}</span>
        </div>
      )}

      <section className="pb-panel">
        <div className="flex items-center justify-between">
          <h2 className="pb-section" style={{ margin: 0 }}>交易記錄</h2>
          <Link
            href={`/trades?ticker=${stock.ticker}`}
            className="text-xs font-medium"
            style={{ color: "var(--accent)" }}
          >
            + 新增交易
          </Link>
        </div>
        {stock.trades.length === 0 ? (
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>未有交易記錄</p>
        ) : (
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs" style={{ color: "var(--muted)" }}>
                <th className="pb-1 font-normal">日期</th>
                <th className="pb-1 font-normal">動作</th>
                <th className="pb-1 font-normal">價格</th>
                <th className="pb-1 font-normal">股數</th>
                <th className="pb-1 font-normal">備註</th>
              </tr>
            </thead>
            <tbody>
              {stock.trades.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td className="py-1">
                    {new Date(t.date).toLocaleDateString("zh-HK")}
                  </td>
                  <td className="py-1">
                    {t.action === "BUY" ? "買入" : "賣出"}
                  </td>
                  <td className="py-1">${t.price.toFixed(2)}</td>
                  <td className="py-1">{t.shares}</td>
                  <td className="py-1" style={{ color: "var(--muted)" }}>{t.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {stock.notes && (
        <section className="pb-panel">
          <h2 className="pb-section" style={{ margin: 0 }}>筆記</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{stock.notes}</p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
