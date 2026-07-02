"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function str(formData: FormData, key: string): string {
  return (formData.get(key) as string | null)?.trim() ?? "";
}

function optStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v.length > 0 ? v : null;
}

function optNum(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function linesToJSON(formData: FormData, key: string): string {
  const raw = str(formData, key);
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return JSON.stringify(lines);
}

export async function updateStock(formData: FormData) {
  const originalTicker = str(formData, "originalTicker");
  const ticker = str(formData, "ticker").toUpperCase();

  const entryTiers = JSON.stringify({
    first: optNum(formData, "entryFirst"),
    add: optNum(formData, "entryAdd"),
    heavy: optNum(formData, "entryHeavy"),
  });

  const factorGrades = JSON.stringify({
    valuation: optStr(formData, "gradeValuation") ?? undefined,
    growth: optStr(formData, "gradeGrowth") ?? undefined,
    profitability: optStr(formData, "gradeProfitability") ?? undefined,
    momentum: optStr(formData, "gradeMomentum") ?? undefined,
    revisions: optStr(formData, "gradeRevisions") ?? undefined,
  });

  const nextEarningsRaw = str(formData, "nextEarnings");

  const data = {
    ticker,
    name: str(formData, "name"),
    driver: str(formData, "driver"),
    industry: optStr(formData, "industry"),
    conviction: str(formData, "conviction") as "HIGH" | "MED" | "LOW",
    positionSize: str(formData, "positionSize") as "LARGE" | "MEDIUM" | "SMALL",
    status: str(formData, "status") as "ACCUMULATE" | "HOLD" | "AVOID",
    synopsis: optStr(formData, "synopsis"),
    entryTiers,
    catalysts: linesToJSON(formData, "catalysts"),
    risks: linesToJSON(formData, "risks"),
    nextEarnings: nextEarningsRaw ? new Date(nextEarningsRaw) : null,
    notes: optStr(formData, "notes"),
    saQuantRating: optStr(formData, "saQuantRating"),
    saAuthorRating: optStr(formData, "saAuthorRating"),
    saFactorGrades: factorGrades,
  };

  if (originalTicker) {
    await prisma.stock.update({
      where: { ticker: originalTicker },
      data,
    });
  } else {
    await prisma.stock.create({ data });
  }

  revalidatePath("/");
  revalidatePath(`/stock/${ticker}`);
  redirect(`/stock/${ticker}`);
}

export async function addTrade(formData: FormData) {
  const ticker = str(formData, "ticker").toUpperCase();
  const stock = await prisma.stock.findUnique({ where: { ticker } });
  if (!stock) throw new Error(`Stock ${ticker} not found`);

  await prisma.trade.create({
    data: {
      stockId: stock.id,
      action: str(formData, "action") as "BUY" | "SELL",
      price: Number(str(formData, "price")),
      shares: Number(str(formData, "shares")),
      date: new Date(str(formData, "date")),
      note: optStr(formData, "note"),
    },
  });

  revalidatePath("/trades");
  revalidatePath(`/stock/${ticker}`);
  redirect("/trades");
}
