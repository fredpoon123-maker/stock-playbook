"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { StockView } from "@/lib/types";
import { CONVICTION_LABEL, POSITION_LABEL, STATUS_LABEL } from "@/lib/types";
import { fmtPrice, fmtDate } from "@/lib/format";

type SortKey = "ticker" | "driver" | "price" | "beta" | "conviction" | "positionSize" | "status" | "entryFirst" | "nextEarnings";

const CONV_RANK: Record<string, number> = { HIGH: 3, MED: 2, LOW: 1 };
const STATUS_RANK: Record<string, number> = { ACCUMULATE: 3, HOLD: 2, AVOID: 1 };

export function SummaryTable({ stocks }: { stocks: StockView[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("ticker");
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    const list = [...stocks];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "ticker":
          cmp = a.ticker.localeCompare(b.ticker);
          break;
        case "driver":
          cmp = a.driver.localeCompare(b.driver);
          break;
        case "price":
          cmp = (a.price ?? -Infinity) - (b.price ?? -Infinity);
          break;
        case "beta":
          cmp = (a.beta ?? -Infinity) - (b.beta ?? -Infinity);
          break;
        case "conviction":
          cmp = (CONV_RANK[a.conviction] ?? 0) - (CONV_RANK[b.conviction] ?? 0);
          break;
        case "positionSize":
          cmp = a.positionSize.localeCompare(b.positionSize);
          break;
        case "status":
          cmp = (STATUS_RANK[a.status] ?? 0) - (STATUS_RANK[b.status] ?? 0);
          break;
        case "entryFirst":
          cmp = (a.entryTiers.first ?? -Infinity) - (b.entryTiers.first ?? -Infinity);
          break;
        case "nextEarnings":
          cmp = (a.nextEarnings ? new Date(a.nextEarnings).getTime() : -Infinity) -
            (b.nextEarnings ? new Date(b.nextEarnings).getTime() : -Infinity);
          break;
      }
      return asc ? cmp : -cmp;
    });
    return list;
  }, [stocks, sortKey, asc]);

  function sortBy(key: SortKey) {
    if (key === sortKey) {
      setAsc(!asc);
    } else {
      setSortKey(key);
      setAsc(true);
    }
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    return (
      <th onClick={() => sortBy(k)}>
        {label}
        <span className="pb-sind">{sortKey === k ? (asc ? "▲" : "▼") : ""}</span>
      </th>
    );
  }

  const statusClass: Record<string, string> = {
    ACCUMULATE: "pb-up",
    HOLD: "pb-nu",
    AVOID: "pb-dn",
  };
  const convClass: Record<string, string> = {
    HIGH: "pb-conv-h",
    MED: "pb-conv-m",
    LOW: "pb-conv-l",
  };

  return (
    <div className="pb-tscroll">
      <table className="pb-summary">
        <thead>
          <tr>
            <Th label="股" k="ticker" />
            <Th label="驅動" k="driver" />
            <Th label="現價" k="price" />
            <Th label="Beta" k="beta" />
            <Th label="信念" k="conviction" />
            <Th label="注碼" k="positionSize" />
            <Th label="立場" k="status" />
            <Th label="第一注" k="entryFirst" />
            <Th label="下次財報" k="nextEarnings" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const status = STATUS_LABEL[s.status];
            return (
              <tr key={s.id}>
                <td className="pb-tk">
                  <Link href={`/stock/${s.ticker}`}>{s.ticker}</Link>
                </td>
                <td>{s.driver}</td>
                <td>{fmtPrice(s.price)}</td>
                <td>{s.beta != null ? s.beta.toFixed(2) : "—"}</td>
                <td className={convClass[s.conviction]}>{CONVICTION_LABEL[s.conviction]}</td>
                <td>{POSITION_LABEL[s.positionSize]}</td>
                <td className={statusClass[s.status]}>
                  {status.emoji} {status.label}
                </td>
                <td>{fmtPrice(s.entryTiers.first)}</td>
                <td>{fmtDate(s.nextEarnings)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
