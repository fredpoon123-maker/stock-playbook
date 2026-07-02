export type EventRow = {
  id: string;
  event: string;
  country: string | null;
  date: string;
  impact: string | null;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
};

const IMPACT_CLASS: Record<string, string> = {
  High: "pb-dn",
  Medium: "pb-nu",
  Low: "pb-up",
};

export function EconomicCalendarTable({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        未來14日未有經濟數據，請等候下次自動刷新。
      </p>
    );
  }

  return (
    <div className="pb-tscroll">
      <table className="pb-summary">
        <thead>
          <tr>
            <th>日期</th>
            <th>國家</th>
            <th>事件</th>
            <th>重要性</th>
            <th>預測</th>
            <th>前值</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.date).toLocaleString("zh-HK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
              <td>{e.country ?? "—"}</td>
              <td>{e.event}</td>
              <td className={e.impact ? IMPACT_CLASS[e.impact] : undefined}>{e.impact ?? "—"}</td>
              <td>{e.forecast ?? "—"}</td>
              <td>{e.previous ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
