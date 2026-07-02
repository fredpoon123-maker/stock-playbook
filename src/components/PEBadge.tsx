export function PEBadge({
  peRatio,
  peerAvgPE,
}: {
  peRatio: number | null | undefined;
  peerAvgPE: number | null | undefined;
}) {
  if (peRatio == null) {
    return <span className="text-xs" style={{ color: "var(--muted)" }}>PE：未有數據</span>;
  }

  if (peerAvgPE == null) {
    return <span className="text-xs" style={{ color: "var(--muted)" }}>PE {peRatio.toFixed(1)}</span>;
  }

  const diffPct = ((peRatio - peerAvgPE) / peerAvgPE) * 100;
  const cheap = diffPct < -5;
  const expensive = diffPct > 5;
  const cls = cheap ? "pb-up" : expensive ? "pb-dn" : "pb-nu";

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={cls}>
        PE {peRatio.toFixed(1)} vs 同業 {peerAvgPE.toFixed(1)}（
        {diffPct > 0 ? "+" : ""}
        {diffPct.toFixed(0)}%）
      </span>
    </div>
  );
}
