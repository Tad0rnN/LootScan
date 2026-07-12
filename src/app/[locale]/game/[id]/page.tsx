import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGameInfo, getStores, formatPrice } from "@/lib/cheapshark";
import { getFallbackGameInfo, fallbackStores } from "@/lib/fallback-data";
import { getGamesplanetDealBySteamAppId } from "@/lib/gamesplanet-deals";
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

/** Cross-references our own Gamesplanet catalog by Steam App ID so this page
 *  shows a real multi-store comparison even when CheapShark is unavailable
 *  and its data falls back to a single-store dataset. */
async function enrichWithOwnSources(gameInfo: GameInfo): Promise<GameInfo> {
  const steamAppID = gameInfo.info.steamAppID;
  if (!steamAppID) return gameInfo;

  const gamesplanetDeal = await getGamesplanetDealBySteamAppId(steamAppID).catch(() => null);
  if (!gamesplanetDeal) return gameInfo;

  return {
    ...gameInfo,
    deals: [...gameInfo.deals.filter((d) => d.storeID !== "27"), gamesplanetDeal],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;

  let info;
  try {
    info = await getGameInfo(id);
  } catch {
    info = getFallbackGameInfo(id) ?? undefined;
  }
  if (!info) {
    return { title: "Game not found | LootScan" };
  }
  info = await enrichWithOwnSources(info);

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
  const [gameInfoRaw, stores] = await Promise.all([
    getGameInfo(id).catch(() => getFallbackGameInfo(id) ?? null),
    getStores().catch(() => fallbackStores),
  ]);

  const gameInfo = gameInfoRaw ? await enrichWithOwnSources(gameInfoRaw) : null;

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
