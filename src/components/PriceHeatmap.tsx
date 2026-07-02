import Link from "next/link";
import type { StockView } from "@/lib/types";
import { squarify } from "@/lib/treemap";
import { heatmapTile } from "@/lib/heatmapColor";
import { sectorOf } from "@/lib/marketUniverse";

export type SnapshotView = {
  ticker: string;
  sector: string;
  changePercent: number | null;
  marketCap: number | null;
};

type HeatItem = {
  key: string;
  ticker: string;
  href: string;
  external: boolean;
  changePercent: number | null;
  weight: number;
  sector: string;
  isHeld: boolean;
};

const CANVAS_W = 1000;
const CANVAS_H = 620;
const LABEL_H = 18;

export function PriceHeatmap({ stocks, snapshot }: { stocks: StockView[]; snapshot: SnapshotView[] }) {
  const knownCaps = [...stocks.map((s) => s.marketCap), ...snapshot.map((s) => s.marketCap)].filter(
    (c): c is number => c != null,
  );
  const fallbackCap = knownCaps.length > 0 ? Math.min(...knownCaps) * 0.4 : 1;

  const placed = new Set(stocks.map((s) => s.ticker));
  const items: HeatItem[] = stocks.map((s) => ({
    key: `hold-${s.ticker}`,
    ticker: s.ticker,
    href: `/stock/${s.ticker}`,
    external: false,
    changePercent: s.changePercent,
    weight: s.marketCap ?? fallbackCap,
    sector: sectorOf(s.ticker) ?? s.industry ?? s.driver,
    isHeld: true,
  }));

  for (const s of snapshot) {
    if (placed.has(s.ticker)) continue;
    placed.add(s.ticker);
    items.push({
      key: `mkt-${s.ticker}`,
      ticker: s.ticker,
      href: `https://finance.yahoo.com/quote/${s.ticker}`,
      external: true,
      changePercent: s.changePercent,
      weight: s.marketCap ?? fallbackCap,
      sector: s.sector,
      isHeld: false,
    });
  }

  const bySector = new Map<string, HeatItem[]>();
  for (const item of items) {
    const list = bySector.get(item.sector) ?? [];
    list.push(item);
    bySector.set(item.sector, list);
  }

  const sectorRects = squarify(
    Array.from(bySector.entries()).map(([sector, list]) => ({
      value: list.reduce((sum, i) => sum + i.weight, 0),
      data: sector,
    })),
    0,
    0,
    CANVAS_W,
    CANVAS_H,
  );

  const tiles = sectorRects.map((region) => {
    const list = bySector.get(region.data) ?? [];
    const innerY = region.y + LABEL_H;
    const innerH = Math.max(region.h - LABEL_H, 0);
    const rects = squarify(
      list.map((i) => ({ value: i.weight, data: i })),
      region.x,
      innerY,
      region.w,
      innerH,
    );
    return { region, rects };
  });

  if (items.length === 0) {
    return (
      <div className="pb-panel">
        <div className="pb-conc-title">今日股價變動</div>
        <div className="pb-conc-sub">未有價位數據，請等候下次自動刷新或撳「即刻刷新價位」。</div>
      </div>
    );
  }

  return (
    <div className="pb-panel">
      <div className="pb-conc-title">今日股價變動（按行業分組，方塊大細 = 市值，金框 = 你持有嘅股票）</div>
      <div className="pb-conc-sub">顏色 = 升跌幅度（綠色=升 / 紅色=跌，深淺代表幅度）。撳市場股票會開Yahoo Finance，撳自己持股會入詳情頁。</div>
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
        {tiles.flatMap(({ rects }) =>
          rects
            .filter((r) => r.w > 0 && r.h > 0)
            .map((r) => {
              const item = r.data;
              const { bg, fg } = heatmapTile(item.changePercent);
              const small = r.w < 60 || r.h < 32;
              const tiny = r.w < 34 || r.h < 22;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  title={`${item.ticker} ${item.changePercent != null ? item.changePercent.toFixed(2) + "%" : ""}`}
                  style={{
                    position: "absolute",
                    left: `${(r.x / CANVAS_W) * 100}%`,
                    top: `${(r.y / CANVAS_H) * 100}%`,
                    width: `${(r.w / CANVAS_W) * 100}%`,
                    height: `${(r.h / CANVAS_H) * 100}%`,
                    background: bg,
                    color: fg,
                    border: item.isHeld ? "2px solid #f5c518" : "1px solid rgba(255,255,255,0.5)",
                    boxSizing: "border-box",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: 1,
                  }}
                >
                  {!tiny && (
                    <span style={{ fontSize: small ? 9.5 : 13, fontWeight: 800, lineHeight: 1.15 }}>
                      {item.isHeld ? "★" : ""}
                      {item.ticker}
                    </span>
                  )}
                  {!small && (
                    <span style={{ fontSize: 11, fontWeight: 700 }}>
                      {item.changePercent != null
                        ? `${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`
                        : "—"}
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
