"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Bell } from "lucide-react";
import { formatPrice, getStoreLogoUrl } from "@/lib/cheapshark";
import type { Deal } from "@/types";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

interface Props {
  deal: Deal;
  featured?: boolean;
}

export default function PopularGameCard({ deal, featured = false }: Props) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const savings = Math.round(parseFloat(deal.savings));
  const isOnSale = savings > 0;
  const isFree = parseFloat(deal.salePrice) === 0;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { window.location.href = "/auth/login"; setLoading(false); return; }

    if (inWishlist) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("game_id", deal.gameID);
      setInWishlist(false);
    } else {
      await supabase.from("wishlist").upsert({
        user_id: user.id,
        game_id: deal.gameID,
        game_title: deal.title,
        game_thumb: deal.thumb,
        normal_price: deal.normalPrice,
        current_price: deal.salePrice,
        notify_on_sale: true,
      });
      setInWishlist(true);
    }
    setLoading(false);
  };

  if (featured) {
    return (
      <Link
        href={`/game/${deal.gameID}`}
        className="group card card-hover flex flex-col overflow-hidden h-full min-h-[280px]"
      >
        <div className="relative flex-1 overflow-hidden bg-slate-900/50 min-h-[200px]">
          <Image
            src={deal.thumb}
            alt={deal.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
              ⭐ Ayın Seçimi
            </span>
            {isOnSale && (
              <span className="badge-savings text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                -{savings}%
              </span>
            )}
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
            {!isOnSale && !inWishlist
              ? <Bell className="w-4 h-4" />
              : <Heart className={clsx("w-4 h-4", inWishlist && "fill-current")} />
            }
          </button>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-lg leading-tight mb-2 line-clamp-2">
              {deal.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className={clsx("font-extrabold text-2xl", isFree ? "text-amber-400" : isOnSale ? "text-brand-400" : "text-white")}>
                  {isFree ? "FREE" : isOnSale ? formatPrice(deal.salePrice) : formatPrice(deal.normalPrice)}
                </span>
                {isOnSale && !isFree && (
                  <span className="text-slate-400 text-sm line-through">{formatPrice(deal.normalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {deal.metacriticScore !== "0" && (
                  <span className="flex items-center gap-1 text-sm text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {deal.metacriticScore}
                  </span>
                )}
                {deal.steamRatingText && (
                  <span className="text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    {deal.steamRatingText} · {deal.steamRatingPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isOnSale && !isFree && (
          <div className="px-4 py-2.5 bg-amber-500/5 border-t border-amber-500/10 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-400/70" />
            <p className="text-xs text-amber-400/70">İndirime girince mail alırsın</p>
          </div>
        )}
      </Link>
    );
  }

  // Normal kart
  return (
    <Link
      href={`/game/${deal.gameID}`}
      className="group card card-hover flex flex-col overflow-hidden"
    >
      <div className="relative overflow-hidden bg-slate-900/50 aspect-[16/7]">
        <Image
          src={deal.thumb}
          alt={deal.title}
          fill
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2.5 left-2.5">
          {isFree ? (
            <span className="badge-free text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">FREE</span>
          ) : isOnSale ? (
            <span className="badge-savings text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">-{savings}%</span>
          ) : (
            <span className="bg-slate-800/80 text-slate-400 border border-white/10 text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
              <Bell className="w-3 h-3" /> Bildir
            </span>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          disabled={loading}
          className={clsx(
            "absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all",
            inWishlist ? "bg-red-500/90 text-white shadow-lg" : "bg-black/40 text-slate-300 hover:bg-black/60 hover:text-red-400"
          )}
        >
          {!isOnSale && !inWishlist
            ? <Bell className="w-3.5 h-3.5" />
            : <Heart className={clsx("w-3.5 h-3.5", inWishlist && "fill-current")} />
          }
        </button>
      </div>

      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {deal.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            {isOnSale || isFree ? (
              <>
                <span className={clsx("font-bold text-base", isFree ? "text-amber-400" : "text-brand-400")}>
                  {formatPrice(deal.salePrice)}
                </span>
                {isOnSale && !isFree && (
                  <span className="text-slate-600 text-xs line-through">{formatPrice(deal.normalPrice)}</span>
                )}
              </>
            ) : (
              <span className="font-bold text-base text-slate-300">{formatPrice(deal.normalPrice)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {deal.metacriticScore !== "0" && (
              <span className="flex items-center gap-0.5 text-xs text-amber-400/80 font-medium">
                <Star className="w-3 h-3 fill-current" />
                {deal.metacriticScore}
              </span>
            )}
            <div className="w-5 h-5 relative opacity-50 group-hover:opacity-80 transition-opacity">
              <Image src={getStoreLogoUrl(deal.storeID)} alt="" fill className="object-contain" />
            </div>
          </div>
        </div>

        {!isOnSale && !isFree && (
          <p className="text-xs text-amber-400/50 flex items-center gap-1">
            <Bell className="w-3 h-3" /> İndirime girince bildir
          </p>
        )}
      </div>
    </Link>
  );
}
