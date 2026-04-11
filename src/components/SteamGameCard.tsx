"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Bell, Users, Clock, ExternalLink, Loader2 } from "lucide-react";
import { formatSteamPrice, formatPlaytime } from "@/lib/steam";
import { getStoreLogoUrl } from "@/lib/cheapshark";
import type { SteamGameWithImage } from "@/lib/steam";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";

const CHEAPSHARK = "https://www.cheapshark.com/api/1.0";

interface StoreDeal {
  storeID: string;
  storeName: string;
  price: string;
  retailPrice: string;
  savings: string;
  dealID: string;
}

interface Props {
  game: SteamGameWithImage;
  rank: number;
  featured?: boolean;
}

function normalizeStoredPrice(price: string): string {
  if (price === "FREE") return "0";
  return price.replace("$", "");
}

// Mağaza isim haritasını tek seferlik cache'le
let cachedStoreMap: Record<string, string> | null = null;
async function getStoreMap(): Promise<Record<string, string>> {
  if (cachedStoreMap) return cachedStoreMap;
  try {
    const r = await fetch(`${CHEAPSHARK}/stores`);
    const stores: { storeID: string; storeName: string }[] = await r.json();
    cachedStoreMap = Object.fromEntries(stores.map((s) => [s.storeID, s.storeName]));
    return cachedStoreMap;
  } catch {
    return {};
  }
}

export default function SteamGameCard({ game, rank, featured = false }: Props) {
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const steamPrice = formatSteamPrice(game.price, game.initialprice, game.discount);
  const playtime = formatPlaytime(game.average_2weeks);
  const locale = useLocale();
  const t = useTranslations("popular");

  // Store deals state
  const [deals, setDeals] = useState<StoreDeal[]>([]);
  const [gameID, setGameID] = useState<string | null>(null);
  const [dealsLoading, setDealsLoading] = useState(true);
  const wishlistGameId = gameID;
  const legacyGameIds = wishlistGameId ? [wishlistGameId, String(game.appid)] : [String(game.appid)];

  // En ucuz fiyat: CheapShark'tan geldiyse onu göster, yoksa Steam fiyatı
  const cheapestDeal = deals[0] ?? null;
  const cheapestPrice = cheapestDeal ? `$${parseFloat(cheapestDeal.price).toFixed(2)}` : steamPrice.current;
  const cheapestOriginal = cheapestDeal
    ? (parseFloat(cheapestDeal.savings) >= 1 ? `$${parseFloat(cheapestDeal.retailPrice).toFixed(2)}` : null)
    : (steamPrice.hasDiscount ? steamPrice.original : null);
  const cheapestSavings = cheapestDeal ? Math.round(parseFloat(cheapestDeal.savings)) : steamPrice.discountPct;
  const isFreePrice = cheapestDeal ? parseFloat(cheapestDeal.price) === 0 : steamPrice.isFree;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const storeMap = await getStoreMap();

        const searchRes = await fetch(`${CHEAPSHARK}/games?title=${encodeURIComponent(game.name)}&limit=10`);
        const searchData = await searchRes.json();
        if (cancelled || !Array.isArray(searchData) || searchData.length === 0) {
          setDealsLoading(false);
          return;
        }

        const match =
          searchData.find((r: { steamAppID: string }) => r.steamAppID === String(game.appid)) ??
          searchData[0];

        if (!match?.gameID) { setDealsLoading(false); return; }
        if (!cancelled) setGameID(match.gameID);

        const infoRes = await fetch(`${CHEAPSHARK}/games?id=${match.gameID}`);
        const info = await infoRes.json();
        if (cancelled) return;

        const sorted: StoreDeal[] = (info?.deals ?? [])
          .map((d: { storeID: string; price: string; retailPrice: string; savings: string; dealID: string }) => ({
            storeID: d.storeID,
            storeName: storeMap[d.storeID] ?? `Store ${d.storeID}`,
            price: d.price,
            retailPrice: d.retailPrice,
            savings: d.savings,
            dealID: d.dealID,
          }))
          .sort((a: StoreDeal, b: StoreDeal) => parseFloat(a.price) - parseFloat(b.price));

        if (!cancelled) setDeals(sorted);
      } catch {
        // sessizce geç
      } finally {
        if (!cancelled) setDealsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [game.appid, game.name]);

  useEffect(() => {
    let cancelled = false;

    async function checkWishlist() {
      if (!wishlistGameId) {
        setInWishlist(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setInWishlist(false);
        return;
      }

      const { data } = await supabase
        .from("wishlist")
        .select("game_id")
        .eq("user_id", user.id)
        .in("game_id", legacyGameIds)
        .limit(1);

      if (!cancelled) {
        setInWishlist((data?.length ?? 0) > 0);
      }
    }

    void checkWishlist();
    return () => { cancelled = true; };
  }, [wishlistGameId, game.appid]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wishlistGameId) return;
    setWishlistLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = `/${locale}/auth/login`; setWishlistLoading(false); return; }

    if (inWishlist) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).in("game_id", legacyGameIds);
      setInWishlist(false);
    } else {
      await supabase.from("wishlist").upsert({
        user_id: user.id,
        game_id: wishlistGameId,
        game_title: game.name,
        game_thumb: game.headerImage,
        normal_price: normalizeStoredPrice(cheapestOriginal ?? cheapestPrice),
        current_price: normalizeStoredPrice(cheapestPrice),
        notify_on_sale: true,
      });
      setInWishlist(true);
    }
    setWishlistLoading(false);
  };

  // Mağaza listesi bölümü
  const storeListSection = (
    <div className="border-t border-white/5 flex flex-col">
      {dealsLoading ? (
        <div className="flex items-center gap-2 px-3 py-2 text-slate-600 text-xs">
          <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
          <span>{t("loadingPrices")}</span>
        </div>
      ) : deals.length > 0 ? (
        <>
          {deals.slice(0, 5).map((deal, idx) => (
            <a
              key={deal.dealID}
              href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-700/50 transition-colors group/deal",
                idx === 0 && "bg-brand-500/5"
              )}
            >
              <Image
                src={getStoreLogoUrl(deal.storeID)}
                alt={deal.storeName}
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
                unoptimized
              />
              <span className="text-slate-400 text-[11px] flex-1 truncate group-hover/deal:text-slate-200 transition-colors">
                {deal.storeName}
              </span>
              {parseFloat(deal.savings) >= 1 && (
                <span className="text-green-400 text-[10px] font-bold">
                  -{Math.round(parseFloat(deal.savings))}%
                </span>
              )}
              <span className={clsx("text-[11px] font-bold", idx === 0 ? "text-brand-400" : "text-white")}>
                ${parseFloat(deal.price).toFixed(2)}
              </span>
              {idx === 0 && (
                <span className="text-[9px] bg-brand-500/20 text-brand-400 px-1 py-0.5 rounded font-bold whitespace-nowrap">
                  {t("bestDeal")}
                </span>
              )}
            </a>
          ))}
          {gameID && (
            <Link
              href={`/${locale}/game/${gameID}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-slate-500 hover:text-brand-400 hover:bg-slate-700/30 transition-colors border-t border-white/5"
          >
            <ExternalLink className="w-3 h-3" />
              {t("comparePrices")}
            </Link>
          )}
        </>
      ) : null}
    </div>
  );

  const steamUrl = `https://store.steampowered.com/app/${game.appid}`;

  if (featured) {
    return (
      <div className="group card flex flex-col overflow-hidden h-full min-h-[300px] relative">
        <div className="relative flex-1 overflow-hidden bg-slate-900/50 min-h-[220px]">
          <Image
            src={game.headerImage}
            alt={game.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Rank badge */}
          <div className="absolute top-3 left-3 flex gap-2 items-center">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-brand-500/30">
              #{rank}
            </div>
            <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
              {t("featuredBadge", { rank })}
            </span>
          </div>

          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading || !wishlistGameId}
            className={clsx(
              "absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all",
              inWishlist ? "bg-red-500/90 text-white shadow-lg" : "bg-black/40 text-slate-300 hover:bg-black/60 hover:text-red-400",
              !wishlistGameId && "cursor-not-allowed opacity-60"
            )}
          >
            {inWishlist ? <Heart className="w-4 h-4 fill-current" /> : <Bell className="w-4 h-4" />}
          </button>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-xl leading-tight mb-3 line-clamp-2">{game.name}</h3>

            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={clsx("font-extrabold text-2xl", isFreePrice ? "text-amber-400" : cheapestSavings > 0 ? "text-brand-400" : "text-white")}>
                    {cheapestPrice}
                  </span>
                  {cheapestOriginal && (
                    <span className="text-slate-400 text-sm line-through">{cheapestOriginal}</span>
                  )}
                  {cheapestSavings > 0 && (
                    <span className="badge-savings text-xs px-1.5 py-0.5">-{cheapestSavings}%</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {game.ccu > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {t("playersCount", { count: game.ccu.toLocaleString("en-US") })}
                    </span>
                  )}
                  {playtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t("averagePlaytime", { time: playtime })}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={steamUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-[#1b2838] hover:bg-[#2a475e] border border-[#2a475e] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t("steam")}
              </a>
            </div>
          </div>
        </div>

        {storeListSection}

        <div className="px-4 py-2 bg-purple-500/5 border-t border-purple-500/10 flex items-center justify-between">
          <p className="text-xs text-purple-400/60 flex items-center gap-1.5">
            <Bell className="w-3 h-3" />
            {inWishlist ? t("notifyAdded") : t("notifyHint")}
          </p>
          {game.reviewScore > 0 && (
            <span className="text-xs text-slate-500">👍 {game.reviewScore}%</span>
          )}
        </div>
      </div>
    );
  }

  // Normal kart
  return (
    <div className="group card flex flex-col overflow-hidden">
      <div className="relative overflow-hidden bg-slate-900/50 aspect-[16/7]">
        <Image
          src={game.headerImage}
          alt={game.name}
          fill
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Rank */}
        <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center font-bold text-white text-xs">
          #{rank}
        </div>

        {/* İndirim varsa göster */}
        {cheapestSavings > 0 && !dealsLoading && (
          <div className="absolute top-2.5 right-2.5">
            <span className="badge-savings text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
              -{cheapestSavings}%
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={toggleWishlist}
          disabled={wishlistLoading || !wishlistGameId}
          className={clsx(
            "absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100",
            inWishlist ? "bg-red-500/90 text-white" : "bg-black/50 text-slate-300 hover:text-red-400",
            !wishlistGameId && "cursor-not-allowed opacity-40 group-hover:opacity-40"
          )}
        >
          {inWishlist ? <Heart className="w-3.5 h-3.5 fill-current" /> : <Bell className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="p-3.5 flex flex-col gap-2">
        <h3 className="font-semibold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {game.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className={clsx("font-bold text-sm", isFreePrice ? "text-amber-400" : cheapestSavings > 0 ? "text-brand-400" : "text-slate-200")}>
              {cheapestPrice}
            </span>
            {cheapestOriginal && (
              <span className="text-slate-600 text-xs line-through">{cheapestOriginal}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {game.ccu > 0 && (
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3" />
                {game.ccu > 1000 ? `${Math.round(game.ccu / 1000)}k` : game.ccu}
              </span>
            )}
            {game.reviewScore > 0 && (
              <span>👍{game.reviewScore}%</span>
            )}
          </div>
        </div>
      </div>

      {storeListSection}
    </div>
  );
}
