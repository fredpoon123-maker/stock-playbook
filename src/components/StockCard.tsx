import Link from "next/link";
import type { PriceCache, Stock } from "@prisma/client";
import {
  CONVICTION_LABEL,
  POSITION_LABEL,
  STATUS_LABEL,
} from "@/lib/types";
import { PEBadge } from "@/components/PEBadge";

export function StockCard({
  stock,
}: {
  stock: Stock & { priceCache: PriceCache | null };
}) {
  const status = STATUS_LABEL[stock.status];

  return (
    <Link
      href={`/stock/${stock.ticker}`}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">{stock.ticker}</span>
            <span>{status.emoji}</span>
          </div>
          <div className="text-sm text-zinc-500">{stock.name}</div>
        </div>
        <div className="text-right text-sm">
          {stock.priceCache?.price != null ? (
            <div className="font-medium">${stock.priceCache.price.toFixed(2)}</div>
          ) : (
            <div className="text-zinc-400">未刷新</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
          {stock.driver}
        </span>
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
          信念 {CONVICTION_LABEL[stock.conviction]}
        </span>
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
          {POSITION_LABEL[stock.positionSize]}
        </span>
      </div>

      {stock.synopsis && (
        <p className="line-clamp-2 text-sm text-zinc-600">{stock.synopsis}</p>
      )}

      <PEBadge
        peRatio={stock.priceCache?.peRatio}
        peerAvgPE={stock.priceCache?.peerAvgPE}
      />
    </Link>
  );
}
