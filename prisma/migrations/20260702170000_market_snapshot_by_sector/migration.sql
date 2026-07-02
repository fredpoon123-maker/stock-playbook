-- DropTable
DROP TABLE "MarketMover";

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT,
    "sector" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketSnapshot_ticker_key" ON "MarketSnapshot"("ticker");
