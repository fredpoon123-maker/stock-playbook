import { StockForm } from "@/components/StockForm";

export default function NewStockPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">新增股票</h1>
      <StockForm />
    </div>
  );
}
