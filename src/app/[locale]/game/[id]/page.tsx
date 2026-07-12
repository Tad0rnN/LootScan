import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGameInfo, getStores, formatPrice } from "@/lib/cheapshark";
import { getFallbackGameInfo, fallbackStores } from "@/lib/fallback-data";
import {
  getGamesplanetDealBySteamAppId,
  getGamesplanetDealByTitle,
  getGamesplanetGameByUid,
} from "@/lib/gamesplanet-deals";
import {
  getGamersgateDealByTitle,
  getGamersgateGameBySku,
} from "@/lib/gamersgate-deals";
import {
  getIndiegalaDealByTitle,
  getIndiegalaGameBySku,
} from "@/lib/indiegala-deals";
import { getSteamStorePrice } from "@/lib/steam-price";
import JsonLd from "@/components/JsonLd";
import {
  SITE,
  buildAlternates,
  productSchema,
  breadcrumbSchema,
} from "@/lib/seo";
import GameDetailClient from "./GameDetailClient";
import type { GameInfo } from "@/types";

// Cache each game page on the edge for 5 minutes
export const revalidate = 300;

/** Cross-references our own Gamesplanet, GamersGate and IndieGala catalogs
 *  (by Steam App ID first, normalized title second), plus the real US Steam
 *  Store price (official appdetails API) whenever a Steam App ID is known —
 *  so this page shows a real multi-store comparison even when CheapShark is
 *  unavailable and its data falls back to a single-store dataset. */
async function enrichWithOwnSources(gameInfo: GameInfo): Promise<GameInfo> {
  const { steamAppID, title } = gameInfo.info;
  const hasStore = (storeID: string) => gameInfo.deals.some((d) => d.storeID === storeID);

  const [gamesplanetDeal, gamersgateDeal, indiegalaDeal] = await Promise.all([
    hasStore("27")
      ? Promise.resolve(null)
      : (steamAppID ? getGamesplanetDealBySteamAppId(steamAppID) : getGamesplanetDealByTitle(title)).catch(() => null),
    hasStore("2") ? Promise.resolve(null) : getGamersgateDealByTitle(title).catch(() => null),
    hasStore("30") ? Promise.resolve(null) : getIndiegalaDealByTitle(title).catch(() => null),
  ]);

  const additions = [gamesplanetDeal, gamersgateDeal, indiegalaDeal].filter(
    (d): d is NonNullable<typeof d> => d !== null
  );
  const resolvedSteamAppID = steamAppID ?? gamesplanetDeal?.steamAppID ?? null;

  if (resolvedSteamAppID && !hasStore("1")) {
    const steamDeal = await getSteamStorePrice(resolvedSteamAppID).catch(() => null);
    if (steamDeal) additions.push(steamDeal);
  }

  if (additions.length === 0) return gameInfo;

  return { ...gameInfo, deals: [...gameInfo.deals, ...additions] };
}

// Own-source gameID prefixes and how to load their base record.
const OWN_SOURCE_LOOKUPS: Record<string, (localId: string) => Promise<Awaited<ReturnType<typeof getGamesplanetGameByUid>>>> = {
  "gp-": getGamesplanetGameByUid,
  "gg-": getGamersgateGameBySku,
  "ig-": getIndiegalaGameBySku,
};

/** Resolves a gameID to a full GameInfo, regardless of which source it
 *  originated from: `gp-<uid>` (Gamesplanet), `gg-<sku>` (GamersGate),
 *  `ig-<sku>` (IndieGala), or a plain CheapShark ID (with a fallback dataset
 *  if CheapShark is down). In every case the result is cross-referenced
 *  against our other own sources so the price comparison table reflects
 *  every store we actually have data for, not just the one the page
 *  happened to originate from. */
async function resolveGameInfo(id: string): Promise<GameInfo | null> {
  const prefix = Object.keys(OWN_SOURCE_LOOKUPS).find((p) => id.startsWith(p));
  if (prefix) {
    const base = await OWN_SOURCE_LOOKUPS[prefix](id.slice(prefix.length)).catch(() => null);
    if (!base) return null;
    const gameInfo: GameInfo = {
      info: { title: base.title, steamAppID: base.steamAppID, thumb: base.thumb },
      cheapestPriceEver: { price: base.deal.price, date: Math.floor(Date.now() / 1000) },
      deals: [base.deal],
    };
    return enrichWithOwnSources(gameInfo);
  }

  const gameInfo = await getGameInfo(id).catch(() => getFallbackGameInfo(id) ?? null);
  return gameInfo ? enrichWithOwnSources(gameInfo) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;

  const info = await resolveGameInfo(id);
  if (!info) {
    return { title: "Game not found | LootScan" };
  }

  const cheapest = info.deals?.length
    ? [...info.deals].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0]
    : null;

  const priceFragment = cheapest
    ? ` from ${formatPrice(cheapest.price)}`
    : "";
  const savingsFragment = cheapest && parseFloat(cheapest.savings) > 0
    ? ` (-${Math.round(parseFloat(cheapest.savings))}%)`
    : "";

  const title = `${info.info.title}${priceFragment}${savingsFragment} — Best Deals | LootScan`;
  const description = `Compare prices for ${info.info.title} across Steam, Epic, GOG and more. Find the cheapest deal${priceFragment} and track price history.`;

  const alternates = buildAlternates(locale, `/game/${id}`);

  return {
    // title already ends with "| LootScan" — absolute avoids the
    // layout template doubling the suffix.
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "LootScan",
      type: "website",
      images: info.info.thumb ? [{ url: info.info.thumb }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: info.info.thumb ? [info.info.thumb] : undefined,
    },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!id?.trim()) notFound();

  // Fetch game + stores in parallel, fall back on any error
  const [gameInfo, stores] = await Promise.all([
    resolveGameInfo(id),
    getStores().catch(() => fallbackStores),
  ]);

  if (!gameInfo) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-lg mb-6">
          Could not load game info. Please try again.
        </p>
        <Link
          href={`/${locale}/deals`}
          className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to deals
        </Link>
      </div>
    );
  }

  const prices = (gameInfo.deals ?? [])
    .map((d) => parseFloat(d.price))
    .filter((p) => !Number.isNaN(p));
  const structuredData: Array<Record<string, unknown>> = [];
  if (prices.length > 0) {
    structuredData.push(
      productSchema({
        name: gameInfo.info.title,
        description: `Compare prices for ${gameInfo.info.title} across Steam, Epic, GOG and more.`,
        image: gameInfo.info.thumb || undefined,
        url: `${SITE}/${locale}/game/${id}`,
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: prices.length,
      })
    );
  }
  structuredData.push(
    breadcrumbSchema([
      { name: "Home", url: `${SITE}/${locale}` },
      { name: "Deals", url: `${SITE}/${locale}/deals` },
      { name: gameInfo.info.title, url: `${SITE}/${locale}/game/${id}` },
    ])
  );

  return (
    <>
      {structuredData.length > 0 && <JsonLd data={structuredData} />}
      <GameDetailClient
        id={id}
        gameInfo={gameInfo}
        stores={stores.filter((s) => s.isActive === 1)}
      />
    </>
  );
}
