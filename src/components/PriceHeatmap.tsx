import Link from "next/link";
import type { StockView } from "@/lib/types";
import { squarify } from "@/lib/treemap";
import { heatmapTile } from "@/lib/heatmapColor";

const CANVAS_W = 1000;
const CANVAS_H = 500;
const LABEL_H = 20;

export function PriceHeatmap({ stocks }: { stocks: StockView[] }) {
  const withData = stocks.filter((s) => s.changePercent != null);
  const knownCaps = stocks.map((s) => s.marketCap).filter((c): c is number => c != null);
  const fallbackCap = knownCaps.length > 0 ? Math.min(...knownCaps) * 0.4 : 1;
  const weight = (s: StockView) => s.marketCap ?? fallbackCap;

  const byDriver = new Map<string, StockView[]>();
  for (const s of stocks) {
    const list = byDriver.get(s.driver) ?? [];
    list.push(s);
    byDriver.set(s.driver, list);
  }

  const driverRects = squarify(
    Array.from(byDriver.entries()).map(([driver, list]) => ({
      value: list.reduce((sum, s) => sum + weight(s), 0),
      data: driver,
    })),
    0,
    0,
    CANVAS_W,
    CANVAS_H,
  );

  const tiles = driverRects.map((region) => {
    const list = byDriver.get(region.data) ?? [];
    const innerY = region.y + LABEL_H;
    const innerH = Math.max(region.h - LABEL_H, 0);
    const stockRects = squarify(
      list.map((s) => ({ value: weight(s), data: s })),
      region.x,
      innerY,
      region.w,
      innerH,
    );
    return { region, stockRects };
  });

  return (
    <div className="pb-panel">
      <div className="pb-conc-title">今日股價變動（按驅動因子分組，方塊大細 = 市值）</div>
      <div className="pb-conc-sub">
        {withData.length > 0
          ? "顏色 = 升跌幅度（綠色=升 / 紅色=跌，深淺代表幅度），灰色 = 未刷新。"
          : "未有價位數據，請等候下次自動刷新或手動觸發 /api/refresh-prices。"}
      </div>
      <div style={{ position: "relative", width: "100%", aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}>
        {tiles.map(({ region }) => (
          <div
            key={`label-${region.data}`}
            style={{
              position: "absolute",
              left: `${(region.x / CANVAS_W) * 100}%`,
              top: `${(region.y / CANVAS_H) * 100}%`,
              width: `${(region.w / CANVAS_W) * 100}%`,
              height: `${(LABEL_H / CANVAS_H) * 100}%`,
              background: "var(--navy)",
              color: "#fff",
              fontSize: 10.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              paddingLeft: 6,
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {region.data}
          </div>
        ))}
        {tiles.flatMap(({ stockRects }) =>
          stockRects
            .filter((r) => r.w > 0 && r.h > 0)
            .map((r) => {
              const s = r.data;
              const { bg, fg } = heatmapTile(s.changePercent);
              const small = r.w < 70 || r.h < 40;
              return (
                <Link
                  key={s.id}
                  href={`/stock/${s.ticker}`}
                  style={{
                    position: "absolute",
                    left: `${(r.x / CANVAS_W) * 100}%`,
                    top: `${(r.y / CANVAS_H) * 100}%`,
                    width: `${(r.w / CANVAS_W) * 100}%`,
                    height: `${(r.h / CANVAS_H) * 100}%`,
                    background: bg,
                    color: fg,
                    border: "1px solid rgba(255,255,255,0.5)",
                    boxSizing: "border-box",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: 2,
                  }}
                >
                  <span style={{ fontSize: small ? 10.5 : 14, fontWeight: 800, lineHeight: 1.2 }}>{s.ticker}</span>
                  {!small && (
                    <span style={{ fontSize: 11.5, fontWeight: 700 }}>
                      {s.changePercent != null
                        ? `${s.changePercent >= 0 ? "+" : ""}${s.changePercent.toFixed(2)}%`
                        : "未刷新"}
                    </span>
                  )}
                </Link>
              );
            }),
        )}
      </div>
    </div>
  );
}
