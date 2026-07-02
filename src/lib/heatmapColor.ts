const NEUTRAL: [number, number, number] = [240, 239, 236]; // diverging midpoint gray
const GOOD: [number, number, number] = [12, 163, 12]; // status good green
const CRITICAL: [number, number, number] = [208, 59, 59]; // status critical red

const MAX_ABS_PCT = 5;

function lerp(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function heatmapTile(changePercent: number | null): { bg: string; fg: string } {
  if (changePercent == null) {
    return { bg: "rgb(211, 214, 219)", fg: "var(--ink)" };
  }
  const t = Math.max(-1, Math.min(1, changePercent / MAX_ABS_PCT));
  const [r, g, b] = t >= 0 ? lerp(NEUTRAL, GOOD, t) : lerp(NEUTRAL, CRITICAL, -t);
  const fg = Math.abs(t) >= 0.35 ? "#ffffff" : "var(--ink)";
  return { bg: `rgb(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)})`, fg };
}
