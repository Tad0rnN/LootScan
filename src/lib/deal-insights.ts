import type { GameInfo } from "@/types";

export type DealVerdict = "buyNow" | "strongDeal" | "fairPrice" | "waitForSale";
export type BuyTiming = "buyNow" | "watch" | "wait";

export interface PriceHistoryPoint {
  label: "regular" | "historicalLow" | "current";
  price: number;
  date: number | null;
}

export interface DealInsights {
  score: number;
  verdict: DealVerdict;
  timing: BuyTiming;
  currentPrice: number;
  regularPrice: number;
  historicalLow: number;
  historicalLowDate: number | null;
  savingsPercent: number;
  percentAboveLow: number;
  uniqueStoreCount: number;
  points: PriceHistoryPoint[];
}

function toPrice(value: string | number | null | undefined): number {
  const parsed = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function analyzeDealInsights(gameInfo: GameInfo): DealInsights | null {
  const deals = [...(gameInfo.deals ?? [])]
    .map((deal) => ({
      ...deal,
      priceValue: toPrice(deal.price),
      retailValue: toPrice(deal.retailPrice),
    }))
    .filter((deal) => deal.priceValue >= 0)
    .sort((a, b) => a.priceValue - b.priceValue);

  if (deals.length === 0) return null;

  const cheapestDeal = deals[0];
  const currentPrice = cheapestDeal.priceValue;
  const regularPrice = Math.max(
    ...deals.map((deal) => deal.retailValue),
    currentPrice
  );
  const rawHistoricalLow = toPrice(gameInfo.cheapestPriceEver?.price);
  const historicalLow = rawHistoricalLow > 0 ? rawHistoricalLow : currentPrice;
  const historicalLowDate = gameInfo.cheapestPriceEver?.date ?? null;
  const uniqueStoreCount = new Set(deals.map((deal) => deal.storeID)).size;

  const savingsPercent =
    regularPrice > 0 ? ((regularPrice - currentPrice) / regularPrice) * 100 : 0;
  const percentAboveLow =
    historicalLow > 0 ? ((currentPrice - historicalLow) / historicalLow) * 100 : 0;

  let score = 42;
  score += Math.min(32, savingsPercent * 0.42);
  score += Math.min(10, uniqueStoreCount * 1.6);

  if (currentPrice <= historicalLow * 1.03) score += 24;
  else if (currentPrice <= historicalLow * 1.1) score += 18;
  else if (currentPrice <= historicalLow * 1.25) score += 10;
  else if (currentPrice <= historicalLow * 1.5) score += 3;
  else score -= 10;

  if (savingsPercent < 15) score -= 8;
  if (regularPrice === currentPrice) score -= 6;

  score = Math.round(clamp(score, 18, 98));

  let verdict: DealVerdict = "waitForSale";
  if (score >= 86) verdict = "buyNow";
  else if (score >= 70) verdict = "strongDeal";
  else if (score >= 55) verdict = "fairPrice";

  const recentLowWindow =
    historicalLowDate !== null
      ? Date.now() / 1000 - historicalLowDate < 120 * 24 * 60 * 60
      : false;

  let timing: BuyTiming = "watch";
  if (currentPrice <= historicalLow * 1.05 || savingsPercent >= 70) {
    timing = "buyNow";
  } else if (recentLowWindow && currentPrice > historicalLow * 1.25) {
    timing = "wait";
  }

  return {
    score,
    verdict,
    timing,
    currentPrice,
    regularPrice,
    historicalLow,
    historicalLowDate,
    savingsPercent: Math.round(savingsPercent),
    percentAboveLow: Math.max(0, Math.round(percentAboveLow)),
    uniqueStoreCount,
    points: [
      { label: "regular", price: regularPrice, date: null },
      {
        label: "historicalLow",
        price: historicalLow,
        date: historicalLowDate,
      },
      { label: "current", price: currentPrice, date: Math.floor(Date.now() / 1000) },
    ],
  };
}
