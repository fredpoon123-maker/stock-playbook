import Link from "next/link";
import type { StockView } from "@/lib/types";

const MAX_ABS_PCT = 5;
const GOOD = "12, 163, 12"; // --green rgb
const CRITICAL = "208, 59, 59"; // --red rgb

function tileStyle(changePercent: number | null): React.CSSProperties {
  if (changePercent == null) {
    return { background: "#f1f3f5", border: "1px solid var(--line)" };
  }
  const intensity = Math.min(Math.abs(changePercent) / MAX_ABS_PCT, 1);
  const alpha = 0.08 + intensity * 0.32;
  const rgb = changePercent >= 0 ? GOOD : CRITICAL;
  return {
    background: `rgba(${rgb}, ${alpha})`,
    border: `1px solid rgba(${rgb}, ${Math.min(alpha + 0.2, 0.6)})`,
  };
}

export function PriceHeatmap({ stocks }: { stocks: StockView[] }) {
  const withData = stocks.filter((s) => s.changePercent != null);
  const sorted = [...stocks].sort((a, b) => (b.changePercent ?? -999) - (a.changePercent ?? -999));

  return (
    <div className="pb-panel">
      <div className="pb-conc-title">今日股價變動</div>
      <div className="pb-conc-sub">
        {withData.length > 0
          ? "顏色深淺 = 升跌幅度（綠色=升 / 紅色=跌），未刷新嘅股票顯示灰色。"
          : "未有價位數據，請等候下次自動刷新或手動觸發 /api/refresh-prices。"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 8,
        }}
      >
        {sorted.map((s) => (
          <Link
            key={s.id}
            href={`/stock/${s.ticker}`}
            style={{
              ...tileStyle(s.changePercent),
              borderRadius: 8,
              padding: "10px 8px",
              textDecoration: "none",
              color: "var(--ink)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minHeight: 64,
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 800 }}>{s.ticker}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700 }}>
              {s.changePercent != null ? (
                <>
                  {s.changePercent >= 0 ? "▲" : "▼"} {s.changePercent >= 0 ? "+" : ""}
                  {s.changePercent.toFixed(2)}%
                </>
              ) : (
                "未刷新"
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
