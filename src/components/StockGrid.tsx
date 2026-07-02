"use client";

import { useMemo, useState } from "react";
import type { StockView } from "@/lib/types";
import { StockCard } from "@/components/StockCard";

type Filter = "all" | "ACCUMULATE" | "HOLD" | "AVOID" | { driver: string };

export function StockGrid({ stocks }: { stocks: StockView[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const drivers = useMemo(() => {
    const set = new Set(stocks.map((s) => s.driver));
    return Array.from(set).sort();
  }, [stocks]);

  const filtered = useMemo(() => {
    if (filter === "all") return stocks;
    if (typeof filter === "object") return stocks.filter((s) => s.driver === filter.driver);
    return stocks.filter((s) => s.status === filter);
  }, [stocks, filter]);

  function isActive(f: Filter) {
    if (typeof f === "object") return typeof filter === "object" && filter.driver === f.driver;
    return filter === f;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="pb-filters">
        <button className={`pb-fbtn ${isActive("all") ? "active" : ""}`} onClick={() => setFilter("all")}>
          全部
        </button>
        <button className={`pb-fbtn ${isActive("ACCUMULATE") ? "active" : ""}`} onClick={() => setFilter("ACCUMULATE")}>
          🟢 Accumulate
        </button>
        <button className={`pb-fbtn ${isActive("HOLD") ? "active" : ""}`} onClick={() => setFilter("HOLD")}>
          🟡 Hold/Watch
        </button>
        <button className={`pb-fbtn ${isActive("AVOID") ? "active" : ""}`} onClick={() => setFilter("AVOID")}>
          🔴 Avoid
        </button>
        {drivers.map((d) => (
          <button
            key={d}
            className={`pb-fbtn ${isActive({ driver: d }) ? "active" : ""}`}
            onClick={() => setFilter({ driver: d })}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="pb-grid">
        {filtered.map((stock) => (
          <StockCard key={stock.id} stock={stock} />
        ))}
      </div>
    </div>
  );
}
