-- CreateTable
CREATE TABLE "MarketMover" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT,
    "price" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "exchange" TEXT,
    "category" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketMover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketMover_ticker_category_key" ON "MarketMover"("ticker", "category");
