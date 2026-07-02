import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StockCard } from "@/components/StockCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stocks = await prisma.stock.findMany({
    include: { priceCache: true },
    orderBy: { ticker: "asc" },
  });

  const byDriver = new Map<string, typeof stocks>();
  for (const stock of stocks) {
    const list = byDriver.get(stock.driver) ?? [];
    list.push(stock);
    byDriver.set(stock.driver, list);
  }

  const total = stocks.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            投資 Playbook
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            信念 · 注碼 · 驅動因子 · 買入價位 · PE比較 · 催化劑
          </p>
        </div>
        <Link
          href="/stock/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + 新增股票
        </Link>
      </div>

      {total > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-medium text-zinc-700">驅動因子集中度</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from(byDriver.entries()).map(([driver, list]) => (
              <span
                key={driver}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
              >
                {driver} · {list.length}隻 · {((list.length / total) * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {total === 0 ? (
        <p className="text-sm text-zinc-500">未有股票資料，請先加入。</p>
      ) : (
        Array.from(byDriver.entries()).map(([driver, list]) => (
          <section key={driver} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-zinc-500">{driver}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
