"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ExternalLink } from "lucide-react";
import { formatPrice, getStoreLogoUrl } from "@/lib/cheapshark";
import { getAffiliateLink } from "@/lib/affiliate";
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
  externalHref?: string;
}

export default function DealCard({ deal, wishlisted = false, onWishlistChange, externalHref: rawExternalHref }: Props) {
  const externalHref = rawExternalHref ? getAffiliateLink(rawExternalHref) : undefined;
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

  const cardInner = (
    <div className="flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-slate-950 aspect-[16/7]">
        <Image
          src={deal.thumb}
          alt={deal.title}
          fill
          className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay — always visible at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Savings badge */}
        {savings > 0 && (
          <div className="absolute top-2.5 left-2.5">
            <span className={clsx(
              "text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md tracking-wide",
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
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={clsx(
            "absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-200",
            inWishlist
              ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
              : "bg-black/50 text-slate-400 hover:bg-black/70 hover:text-red-400 border border-white/10"
          )}
        >
          <Heart className={clsx("w-3.5 h-3.5 transition-transform duration-150", inWishlist && "fill-current scale-110", loading && "opacity-50")} />
        </button>

        {/* Store logo — bottom left */}
        {hasStoreLogo && (
          <div className="absolute bottom-2.5 left-2.5 w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
            <Image
              src={getStoreLogoUrl(deal.storeID)}
              alt={`Store ${deal.storeID}`}
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h3 className="font-semibold text-[13px] text-slate-300 line-clamp-2 leading-snug group-hover:text-white transition-colors duration-200">
          {deal.title}
        </h3>

        {/* Price row */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className={clsx(
              "font-bold text-lg leading-none tracking-tight",
              isFree ? "text-amber-400" : "text-brand-400"
            )}>
              {formatPrice(deal.salePrice)}
            </span>
            {savings > 0 && !isFree && (
              <span className="text-slate-600 text-xs line-through font-medium leading-none">
                {formatPrice(deal.normalPrice)}
              </span>
            )}
          </div>

          {deal.metacriticScore !== "0" && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400/80 font-semibold bg-amber-400/10 border border-amber-400/15 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-current" />
              {deal.metacriticScore}
            </span>
          )}
        </div>

        {/* Steam rating */}
        {deal.steamRatingText && (
          <p className="text-[11px] text-slate-600 truncate">
            {deal.steamRatingText}
            <span className="text-slate-700 mx-1">·</span>
            <span className="text-slate-500">{deal.steamRatingPercent}%</span>
          </p>
        )}

        <RegionalSteamPrice appId={deal.steamAppID} compact className="text-slate-600" />
      </div>
    </div>
  );

  const cardClassName = clsx(
    "group card card-hover flex flex-col overflow-hidden",
    "ring-0 hover:ring-1 hover:ring-white/10 transition-all duration-300"
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
