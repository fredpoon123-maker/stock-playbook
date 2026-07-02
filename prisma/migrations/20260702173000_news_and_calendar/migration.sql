-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ticker" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomicEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "country" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "impact" TEXT,
    "actual" TEXT,
    "forecast" TEXT,
    "previous" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsItem_kind_publishedAt_idx" ON "NewsItem"("kind", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_url_kind_key" ON "NewsItem"("url", "kind");

-- CreateIndex
CREATE INDEX "EconomicEvent_date_idx" ON "EconomicEvent"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EconomicEvent_event_country_date_key" ON "EconomicEvent"("event", "country", "date");
