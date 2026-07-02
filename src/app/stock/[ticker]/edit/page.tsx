import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StockForm } from "@/components/StockForm";

export const dynamic = "force-dynamic";

export default async function EditStockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const stock = await prisma.stock.findUnique({
    where: { ticker: ticker.toUpperCase() },
  });

  if (!stock) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">編輯 {stock.ticker}</h1>
      <StockForm stock={stock} />
    </div>
  );
}
