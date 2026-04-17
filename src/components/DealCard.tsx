"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { formatPrice, getStoreLogoUrl } from "@/lib/cheapshark";
import type { Deal } from "@/types";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackAffiliateClick, trackDealClick } from "@/lib/analytics";
import clsx from "clsx";
import { useLocale } from "next-intl";
import RegionalSteamPrice from "./RegionalSteamPrice";

interface Props {
  deal: Deal;
  wishlisted?: boolean;
  onWishlistChange?: () => void;
  /** If set, the card links to this external URL instead of our /game/[id] page. */
  externalHref?: string;
}

export default function DealCard({ deal, wishlisted = false, onWishlistChange, externalHref }: Props) {
  const [inWishlist, setInWishlist] = useState(wishlisted);
  const [loading, setLoading] = useState(false);
  const savings = Math.round(parseFloat(deal.savings));
  const isFree = parseFloat(deal.salePrice) === 0;
  const locale = useLocale();
  const hasStoreLogo = Number.isFinite(Number(deal.storeID)) && Number(deal.storeID) > 0;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/${locale}/auth/login`;
      setLoading(false);
      return;
    }

    if (inWishlist) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("game_id", deal.gameID);
      setInWishlist(false);
    } else {
      await supabase.from("wishlist").upsert({
        user_id: user.id,
        game_id: deal.gameID,
        locale,
        game_title: deal.title,
        game_thumb: deal.thumb,
        normal_price: deal.normalPrice,
        current_price: deal.salePrice,
      });
      setInWishlist(true);
    }
    setLoading(false);
    onWishlistChange?.();
  };

  const cardClassName = "group card card-hover flex flex-col overflow-hidden";
  const cardInner = (
    <>
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-slate-900/50 aspect-[16/7]">
        <Image
          src={deal.thumb}
          alt={deal.title}
          fill
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Savings badge */}
        {savings > 0 && (
          <div className="absolute top-2.5 left-2.5">
            <span className={clsx(
              "text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm",
              isFree ? "badge-free" : "badge-savings"
            )}>
              {isFree ? "FREE" : `-${savings}%`}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          disabled={loading}
          className={clsx(
            "absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-150",
            inWishlist
              ? "bg-red-500/90 text-white shadow-lg shadow-red-500/30"
              : "bg-black/40 text-slate-300 hover:bg-black/60 hover:text-red-400"
          )}
        >
          <Heart className={clsx("w-3.5 h-3.5", inWishlist && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <h3 className="font-semibold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {deal.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className={clsx("font-bold text-base", isFree ? "text-amber-400" : "text-brand-400")}>
              {formatPrice(deal.salePrice)}
            </span>
            {savings > 0 && !isFree && (
              <span className="text-slate-600 text-xs line-through font-medium">
                {formatPrice(deal.normalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {deal.metacriticScore !== "0" && (
              <span className="flex items-center gap-0.5 text-xs text-amber-400/80 font-medium">
                <Star className="w-3 h-3 fill-current" />
                {deal.metacriticScore}
              </span>
            )}
            {hasStoreLogo && (
              <div className="w-5 h-5 relative opacity-50 group-hover:opacity-80 transition-opacity">
                <Image
                  src={getStoreLogoUrl(deal.storeID)}
                  alt={`Store ${deal.storeID}`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {deal.steamRatingText && (
          <p className="text-xs text-slate-600 truncate">{deal.steamRatingText} · {deal.steamRatingPercent}%</p>
        )}

        <RegionalSteamPrice appId={deal.steamAppID} compact className="text-slate-500" />
      </div>
    </>
  );

  if (externalHref) {
    return (
      <a
        href={externalHref}
        target="_blank"
        rel="noreferrer"
        className={cardClassName}
        onClick={(e) => {
          if (e.defaultPrevented) return;
          trackAffiliateClick({
            deal_id: deal.dealID,
            game_id: deal.gameID,
            title: deal.title,
            store_id: deal.storeID,
            destination_url: externalHref,
            sale_price: deal.salePrice,
            placement: "deal_card",
          });
        }}
      >
        {cardInner}
      </a>
    );
  }

  return (
    <Link
      href={`/${locale}/game/${deal.gameID}`}
      className={cardClassName}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        trackDealClick({
          deal_id: deal.dealID,
          game_id: deal.gameID,
          title: deal.title,
          store_id: deal.storeID,
          sale_price: deal.salePrice,
          placement: "deal_card",
        });
      }}
    >
      {cardInner}
    </Link>
  );
}
