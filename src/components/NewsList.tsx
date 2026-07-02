export type NewsRow = {
  id: string;
  ticker: string | null;
  title: string;
  url: string;
  source: string | null;
  publishedAt: string;
};

export function NewsList({ items, emptyLabel }: { items: NewsRow[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="flex flex-col" style={{ gap: 2 }}>
      {items.map((n) => (
        <li key={n.id} style={{ borderBottom: "1px solid var(--line)", padding: "9px 0" }}>
          <a
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--navy)", fontWeight: 600, fontSize: 13.5, textDecoration: "none" }}
          >
            {n.ticker && (
              <span className="pb-dtag" style={{ background: "var(--blue)", marginRight: 6 }}>
                {n.ticker}
              </span>
            )}
            {n.title}
          </a>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            {n.source ?? "—"} · {new Date(n.publishedAt).toLocaleString("zh-HK")}
          </div>
        </li>
      ))}
    </ul>
  );
}
