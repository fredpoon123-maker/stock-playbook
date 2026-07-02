export type TreemapRect<T> = { x: number; y: number; w: number; h: number; data: T };

type Item<T> = { value: number; data: T };

export function squarify<T>(rawItems: Item<T>[], x: number, y: number, w: number, h: number): TreemapRect<T>[] {
  const items = rawItems.filter((i) => i.value > 0);
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total <= 0 || items.length === 0 || w <= 0 || h <= 0) return [];

  const area = w * h;
  const scaled = items
    .map((i) => ({ value: (i.value / total) * area, data: i.data }))
    .sort((a, b) => b.value - a.value);

  const out: TreemapRect<T>[] = [];
  layout(scaled, x, y, w, h, out);
  return out;
}

function worst(row: { value: number }[], side: number): number {
  const sum = row.reduce((s, r) => s + r.value, 0);
  const max = Math.max(...row.map((r) => r.value));
  const min = Math.min(...row.map((r) => r.value));
  const s2 = side * side;
  const sum2 = sum * sum;
  return Math.max((s2 * max) / sum2, sum2 / (s2 * min));
}

function layout<T>(
  items: { value: number; data: T }[],
  x: number,
  y: number,
  w: number,
  h: number,
  out: TreemapRect<T>[],
) {
  if (items.length === 0) return;
  if (items.length === 1 || w <= 0 || h <= 0) {
    out.push({ x, y, w, h, data: items[0].data });
    for (const rest of items.slice(1)) out.push({ x, y, w: 0, h: 0, data: rest.data });
    return;
  }

  const shortSide = Math.min(w, h);
  let row: typeof items = [items[0]];
  let i = 1;

  while (i < items.length) {
    const candidate = [...row, items[i]];
    if (worst(candidate, shortSide) <= worst(row, shortSide)) {
      row = candidate;
      i++;
    } else {
      break;
    }
  }

  const rowSum = row.reduce((s, r) => s + r.value, 0);
  const isWide = w >= h;

  if (isWide) {
    const rowWidth = rowSum / h;
    let cy = y;
    for (const r of row) {
      const rh = r.value / rowWidth;
      out.push({ x, y: cy, w: rowWidth, h: rh, data: r.data });
      cy += rh;
    }
    layout(items.slice(row.length), x + rowWidth, y, w - rowWidth, h, out);
  } else {
    const rowHeight = rowSum / w;
    let cx = x;
    for (const r of row) {
      const rw = r.value / rowHeight;
      out.push({ x: cx, y, w: rw, h: rowHeight, data: r.data });
      cx += rw;
    }
    layout(items.slice(row.length), x, y + rowHeight, w, h - rowHeight, out);
  }
}
