-- AlterTable
ALTER TABLE "PriceCache" ADD COLUMN     "changePercent" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PriceBar" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,

    CONSTRAINT "PriceBar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceBar_ticker_idx" ON "PriceBar"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "PriceBar_ticker_date_key" ON "PriceBar"("ticker", "date");
