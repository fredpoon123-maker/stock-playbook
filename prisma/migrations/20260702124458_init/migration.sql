-- CreateEnum
CREATE TYPE "Conviction" AS ENUM ('HIGH', 'MED', 'LOW');

-- CreateEnum
CREATE TYPE "PositionSize" AS ENUM ('LARGE', 'MEDIUM', 'SMALL');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('ACCUMULATE', 'HOLD', 'AVOID');

-- CreateEnum
CREATE TYPE "TradeAction" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "industry" TEXT,
    "conviction" "Conviction" NOT NULL,
    "positionSize" "PositionSize" NOT NULL,
    "status" "StockStatus" NOT NULL,
    "synopsis" TEXT,
    "entryTiers" TEXT,
    "catalysts" TEXT,
    "risks" TEXT,
    "nextEarnings" TIMESTAMP(3),
    "notes" TEXT,
    "saQuantRating" TEXT,
    "saFactorGrades" TEXT,
    "saAuthorRating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "action" "TradeAction" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceCache" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "peRatio" DOUBLE PRECISION,
    "peerAvgPE" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "beta" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_ticker_key" ON "Stock"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "PriceCache_stockId_key" ON "PriceCache"("stockId");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceCache" ADD CONSTRAINT "PriceCache_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
