"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Bell, Users, Clock, ExternalLink } from "lucide-react";
import { formatSteamPrice, formatPlaytime } from "@/lib/steam";
import type { SteamGameWithImage } from "@/lib/steam";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";

interface Props {
  game: SteamGameWithImage;
  rank: number;
  featured?: boolean;
  gameID?: string;
}

export default function SteamGameCard({ game, rank, featured = false, gameID }: Props) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const price = formatSteamPrice(game.price, game.discount);
  const playtime = formatPlaytime(game.average_2weeks);
  const locale = useLocale();
  const t = useTranslations("popular");
  const internalGameUrl = gameID ? `/${locale}/game/${gameID}` : null;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { window.location.href = `/${locale}/auth/login`; setLoading(false); return; }

    if (inWishlist) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("game_id", gameID ?? String(game.appid));
      setInWishlist(false);
    } else {
      await supabase.from("wishlist").upsert({
        user_id: user.id,
        game_id: gameID ?? String(game.appid),
        game_title: game.name,
        game_thumb: game.headerImage,
        normal_price: String(parseInt(game.price || "0") / 100),
        current_price: String(parseInt(game.price || "0") / 100),
        notify_on_sale: true,
      });
      setInWishlist(true);
    }
    setLoading(false);
  };

  const steamUrl = `https://store.steampowered.com/app/${game.appid}`;
  const actionUrl = internalGameUrl ?? steamUrl;
  const actionLabel = internalGameUrl ? t("comparePrices") : t("steam");

  if (featured) {
    return (
      <Link href={actionUrl} className="group card card-hover flex flex-col overflow-hidden h-full min-h-[300px] relative">
        {/* Image */}
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
            disabled={loading}
            className={clsx(
              "absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all",
              inWishlist ? "bg-red-500/90 text-white shadow-lg" : "bg-black/40 text-slate-300 hover:bg-black/60 hover:text-red-400"
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
                  <span className={clsx("font-extrabold text-2xl", price.isFree ? "text-amber-400" : price.hasDiscount ? "text-brand-400" : "text-white")}>
                    {price.current}
                  </span>
                  {price.hasDiscount && (
                    <span className="text-slate-400 text-sm line-through">{price.original}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {game.ccu > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {t("playersCount", { count: game.ccu.toLocaleString() })}
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

              <div className="flex gap-2">
                {internalGameUrl ? (
                  <span className="flex items-center gap-1.5 bg-[#1b2838] hover:bg-[#2a475e] border border-[#2a475e] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {actionLabel}
                  </span>
                ) : (
                  <a
                    href={steamUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 bg-[#1b2838] hover:bg-[#2a475e] border border-[#2a475e] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {actionLabel}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notify bar */}
        <div className="px-4 py-2.5 bg-purple-500/5 border-t border-purple-500/10 flex items-center justify-between">
          <p className="text-xs text-purple-400/60 flex items-center gap-1.5">
            <Bell className="w-3 h-3" />
            {inWishlist ? t("notifyAdded") : t("notifyHint")}
          </p>
          {game.reviewScore > 0 && (
            <span className="text-xs text-slate-500">👍 {game.reviewScore}%</span>
          )}
        </div>
      </Link>
    );
  }

  // Normal kart
  const cardBody = (
    <>
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

        {/* Discount */}
        {price.hasDiscount && (
          <div className="absolute top-2.5 right-2.5">
            <span className="badge-savings text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
              -{price.discountPct}%
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(e); }}
          disabled={loading}
          className={clsx(
            "absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100",
            inWishlist ? "bg-red-500/90 text-white" : "bg-black/50 text-slate-300 hover:text-red-400"
          )}
        >
          {inWishlist ? <Heart className="w-3.5 h-3.5 fill-current" /> : <Bell className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {game.name}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className={clsx("font-bold text-sm", price.isFree ? "text-amber-400" : price.hasDiscount ? "text-brand-400" : "text-slate-200")}>
              {price.current}
            </span>
            {price.hasDiscount && (
              <span className="text-slate-600 text-xs line-through">{price.original}</span>
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
    </>
  );

  if (internalGameUrl) {
    return (
      <Link href={internalGameUrl} className="group card card-hover flex flex-col overflow-hidden">
        {cardBody}
      </Link>
    );
  }

  return (
    <a
      href={steamUrl}
      target="_blank"
      rel="noreferrer"
      className="group card card-hover flex flex-col overflow-hidden"
    >
      {cardBody}
    </a>
  );
}
