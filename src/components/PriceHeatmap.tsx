import Link from "next/link";
import type { StockView } from "@/lib/types";
import { squarify } from "@/lib/treemap";
import { heatmapTile } from "@/lib/heatmapColor";

export type MoverView = {
  ticker: string;
  name: string | null;
  changePercent: number | null;
  category: "GAINER" | "LOSER" | "ACTIVE";
};

type HeatItem = {
  key: string;
  ticker: string;
  href: string;
  changePercent: number | null;
  weight: number;
  group: string;
};

const CANVAS_W = 1000;
const CANVAS_H = 620;
const LABEL_H = 18;
const GROUP_ORDER = ["我的持股", "今日升幅最大", "今日跌幅最大", "成交最活躍"];

export function PriceHeatmap({ stocks, movers }: { stocks: StockView[]; movers: MoverView[] }) {
  const knownCaps = stocks.map((s) => s.marketCap).filter((c): c is number => c != null);
  const fallbackCap = knownCaps.length > 0 ? Math.min(...knownCaps) * 0.4 : 1;

  const placed = new Set(stocks.map((s) => s.ticker));
  const items: HeatItem[] = stocks.map((s) => ({
    key: `hold-${s.ticker}`,
    ticker: s.ticker,
    href: `/stock/${s.ticker}`,
    changePercent: s.changePercent,
    weight: s.marketCap ?? fallbackCap,
    group: "我的持股",
  }));

  const moverGroup: Record<MoverView["category"], string> = {
    GAINER: "今日升幅最大",
    LOSER: "今日跌幅最大",
    ACTIVE: "成交最活躍",
  };

  for (const category of ["GAINER", "LOSER", "ACTIVE"] as const) {
    for (const m of movers.filter((mv) => mv.category === category)) {
      if (placed.has(m.ticker)) continue;
      placed.add(m.ticker);
      items.push({
        key: `${category}-${m.ticker}`,
        ticker: m.ticker,
        href: `https://finance.yahoo.com/quote/${m.ticker}`,
        changePercent: m.changePercent,
        weight: Math.max(Math.abs(m.changePercent ?? 0.5), 0.5),
        group: moverGroup[category],
      });
    }
  }

  const byGroup = new Map<string, HeatItem[]>();
  for (const item of items) {
    const list = byGroup.get(item.group) ?? [];
    list.push(item);
    byGroup.set(item.group, list);
  }

  const groupRects = squarify(
    GROUP_ORDER.filter((g) => byGroup.has(g)).map((group) => ({
      value: (byGroup.get(group) ?? []).reduce((sum, i) => sum + i.weight, 0),
      data: group,
    })),
    0,
    0,
    CANVAS_W,
    CANVAS_H,
  );

  const tiles = groupRects.map((region) => {
    const list = byGroup.get(region.data) ?? [];
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
      <div className="pb-conc-title">今日股價變動（我的持股 + 全市場今日升幅/跌幅/成交最活躍）</div>
      <div className="pb-conc-sub">顏色 = 升跌幅度（綠色=升 / 紅色=跌，深淺代表幅度），灰色 = 未有數據。方塊大細：持股按市值，其他按升跌幅度。</div>
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
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  title={`${item.ticker} ${item.changePercent != null ? item.changePercent.toFixed(2) + "%" : ""}`}
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
                    padding: 1,
                  }}
                >
                  {!tiny && (
                    <span style={{ fontSize: small ? 9.5 : 13, fontWeight: 800, lineHeight: 1.15 }}>
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
