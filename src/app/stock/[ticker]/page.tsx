import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PEBadge } from "@/components/PEBadge";
import {
  CONVICTION_LABEL,
  POSITION_LABEL,
  STATUS_LABEL,
  parseJSON,
  type EntryTiers,
  type FactorGrades,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  const stock = await prisma.stock.findUnique({
    where: { ticker: ticker.toUpperCase() },
    include: { priceCache: true, trades: { orderBy: { date: "desc" } } },
  });

  if (!stock) notFound();

  const status = STATUS_LABEL[stock.status];
  const entryTiers = parseJSON<EntryTiers>(stock.entryTiers, {
    first: null,
    add: null,
    heavy: null,
  });
  const catalysts = parseJSON<string[]>(stock.catalysts, []);
  const risks = parseJSON<string[]>(stock.risks, []);
  const factorGrades = parseJSON<FactorGrades>(stock.saFactorGrades, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{stock.ticker}</h1>
            <span>{status.emoji}</span>
            <span className="text-sm text-zinc-500">{status.label}</span>
          </div>
          <p className="text-zinc-500">{stock.name}</p>
        </div>
        <Link
          href={`/stock/${stock.ticker}/edit`}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          編輯
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="信念" value={CONVICTION_LABEL[stock.conviction]} />
        <Stat label="注碼" value={POSITION_LABEL[stock.positionSize]} />
        <Stat label="驅動" value={stock.driver} />
        <Stat
          label="現價"
          value={
            stock.priceCache?.price != null
              ? `$${stock.priceCache.price.toFixed(2)}`
              : "未刷新"
          }
        />
      </div>

      {stock.synopsis && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500">簡介</h2>
          <p className="mt-1 text-zinc-700">{stock.synopsis}</p>
        </section>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">估值 / PE比較</h2>
        <div className="mt-2">
          <PEBadge
            peRatio={stock.priceCache?.peRatio}
            peerAvgPE={stock.priceCache?.peerAvgPE}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">買入框架</h2>
        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
          <EntryTier label="第一注" value={entryTiers.first} />
          <EntryTier label="加注" value={entryTiers.add} />
          <EntryTier label="重注" value={entryTiers.heavy} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-500">催化劑</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {catalysts.length === 0 && <li className="text-zinc-400 list-none pl-0">—</li>}
            {catalysts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-500">風險 ⚠️</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {risks.length === 0 && <li className="text-zinc-400 list-none pl-0">—</li>}
            {risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">
          Seeking Alpha Premium資料（手動輸入）
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Stat label="Quant Rating" value={stock.saQuantRating || "—"} />
          <Stat label="Author Rating" value={stock.saAuthorRating || "—"} />
          <Stat label="Valuation Grade" value={factorGrades.valuation || "—"} />
          <Stat label="Growth Grade" value={factorGrades.growth || "—"} />
          <Stat label="Profitability" value={factorGrades.profitability || "—"} />
          <Stat label="Momentum" value={factorGrades.momentum || "—"} />
          <Stat label="Revisions" value={factorGrades.revisions || "—"} />
        </div>
      </section>

      {stock.nextEarnings && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500">下次業績</h2>
          <p className="mt-1 text-zinc-700">
            {new Date(stock.nextEarnings).toLocaleDateString("zh-HK")}
          </p>
        </section>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-500">交易記錄</h2>
          <Link
            href={`/trades?ticker=${stock.ticker}`}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            + 新增交易
          </Link>
        </div>
        {stock.trades.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">未有交易記錄</p>
        ) : (
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-400">
                <th className="pb-1 font-normal">日期</th>
                <th className="pb-1 font-normal">動作</th>
                <th className="pb-1 font-normal">價格</th>
                <th className="pb-1 font-normal">股數</th>
                <th className="pb-1 font-normal">備註</th>
              </tr>
            </thead>
            <tbody>
              {stock.trades.map((t) => (
                <tr key={t.id} className="border-t border-zinc-100">
                  <td className="py-1">
                    {new Date(t.date).toLocaleDateString("zh-HK")}
                  </td>
                  <td className="py-1">
                    {t.action === "BUY" ? "買入" : "賣出"}
                  </td>
                  <td className="py-1">${t.price.toFixed(2)}</td>
                  <td className="py-1">{t.shares}</td>
                  <td className="py-1 text-zinc-500">{t.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {stock.notes && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500">筆記</h2>
          <p className="mt-1 whitespace-pre-wrap text-zinc-700">{stock.notes}</p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-medium text-zinc-800">{value}</div>
    </div>
  );
}

function EntryTier({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-base font-semibold text-zinc-800">
        {value != null ? `$${value.toFixed(2)}` : "—"}
      </div>
    </div>
  );
}
