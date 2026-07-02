"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { key: "heatmap", label: "🔥 Heatmap" },
  { key: "news", label: "📰 重要新聞總結" },
  { key: "upcoming", label: "🔭 前瞻新聞" },
  { key: "calendar", label: "📅 Economic Calendar" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function DashboardTabs({
  heatmap,
  news,
  upcoming,
  calendar,
}: {
  heatmap: ReactNode;
  news: ReactNode;
  upcoming: ReactNode;
  calendar: ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("heatmap");
  const panels: Record<TabKey, ReactNode> = { heatmap, news, upcoming, calendar };

  return (
    <div className="flex flex-col gap-3">
      <div className="pb-filters">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`pb-fbtn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div key={t.key} style={{ display: tab === t.key ? "block" : "none" }}>
          {panels[t.key]}
        </div>
      ))}
    </div>
  );
}
