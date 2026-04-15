import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGameInfo, getStores, formatPrice } from "@/lib/cheapshark";
import { getFallbackGameInfo, fallbackStores } from "@/lib/fallback-data";
import { routing } from "@/i18n/routing";
import GameDetailClient from "./GameDetailClient";

const SITE = "https://lootscan.co";

// Cache each game page on the edge for 5 minutes
export const revalidate = 300;

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

  const canonical = `${SITE}/${locale}/game/${id}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE}/${l}/game/${id}`;
  }

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
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
    getGameInfo(id).catch(() => getFallbackGameInfo(id) ?? null),
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

  return (
    <GameDetailClient
      id={id}
      gameInfo={gameInfo}
      stores={stores.filter((s) => s.isActive === 1)}
    />
  );
}
