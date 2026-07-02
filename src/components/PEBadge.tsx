export function PEBadge({
  peRatio,
  peerAvgPE,
}: {
  peRatio: number | null | undefined;
  peerAvgPE: number | null | undefined;
}) {
  if (peRatio == null) {
    return <span className="text-xs text-zinc-400">PE：未有數據</span>;
  }

  if (peerAvgPE == null) {
    return <span className="text-xs text-zinc-500">PE {peRatio.toFixed(1)}</span>;
  }

  const diffPct = ((peRatio - peerAvgPE) / peerAvgPE) * 100;
  const cheap = diffPct < -5;
  const expensive = diffPct > 5;
  const color = cheap
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : expensive
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-zinc-50 text-zinc-600 border-zinc-200";

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={`rounded border px-1.5 py-0.5 font-medium ${color}`}>
        PE {peRatio.toFixed(1)} vs 同業 {peerAvgPE.toFixed(1)}（
        {diffPct > 0 ? "+" : ""}
        {diffPct.toFixed(0)}%）
      </span>
    </div>
  );
}
