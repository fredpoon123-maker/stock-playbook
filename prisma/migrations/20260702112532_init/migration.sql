-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "industry" TEXT,
    "conviction" TEXT NOT NULL,
    "positionSize" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "synopsis" TEXT,
    "entryTiers" TEXT,
    "catalysts" TEXT,
    "risks" TEXT,
    "nextEarnings" DATETIME,
    "notes" TEXT,
    "saQuantRating" TEXT,
    "saFactorGrades" TEXT,
    "saAuthorRating" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stockId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "shares" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trade_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stockId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "price" REAL,
    "peRatio" REAL,
    "peerAvgPE" REAL,
    "marketCap" REAL,
    "beta" REAL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceCache_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_ticker_key" ON "Stock"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "PriceCache_stockId_key" ON "PriceCache"("stockId");
