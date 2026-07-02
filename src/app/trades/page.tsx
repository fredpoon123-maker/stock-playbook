import { prisma } from "@/lib/prisma";
import { addTrade } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const { ticker } = await searchParams;

  const [trades, stocks] = await Promise.all([
    prisma.trade.findMany({
      include: { stock: true },
      orderBy: { date: "desc" },
    }),
    prisma.stock.findMany({ orderBy: { ticker: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">交易記錄</h1>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">新增交易</h2>
        <form action={addTrade} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">股票</span>
            <select name="ticker" defaultValue={ticker ?? ""} required className="input">
              <option value="" disabled>
                揀股票
              </option>
              {stocks.map((s) => (
                <option key={s.id} value={s.ticker}>
                  {s.ticker} · {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">動作</span>
            <select name="action" defaultValue="BUY" className="input">
              <option value="BUY">買入</option>
              <option value="SELL">賣出</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">價格</span>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              className="input w-28"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">股數</span>
            <input
              type="number"
              step="0.0001"
              name="shares"
              required
              className="input w-24"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">日期</span>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
              className="input"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">備註</span>
            <input name="note" className="input" />
          </label>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            新增
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">歷史記錄</h2>
        {trades.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">未有交易記錄</p>
        ) : (
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-400">
                <th className="pb-1 font-normal">日期</th>
                <th className="pb-1 font-normal">股票</th>
                <th className="pb-1 font-normal">動作</th>
                <th className="pb-1 font-normal">價格</th>
                <th className="pb-1 font-normal">股數</th>
                <th className="pb-1 font-normal">備註</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-t border-zinc-100">
                  <td className="py-1">
                    {new Date(t.date).toLocaleDateString("zh-HK")}
                  </td>
                  <td className="py-1 font-medium">{t.stock.ticker}</td>
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
    </div>
  );
}
