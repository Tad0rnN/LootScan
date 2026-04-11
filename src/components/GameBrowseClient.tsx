"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, Bell, Loader2, GamepadIcon, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import type { SearchResult } from "@/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function GameCard({ game, onWishlistChange }: {
  game: SearchResult & { inWishlist: boolean };
  onWishlistChange: (gameID: string, added: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const t = useTranslations("browse");

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/${locale}/auth/login`;
      setLoading(false);
      return;
    }

    if (game.inWishlist) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("game_id", game.gameID);
      onWishlistChange(game.gameID, false);
    } else {
      await supabase.from("wishlist").upsert({
        user_id: user.id,
        game_id: game.gameID,
        game_title: game.external,
        game_thumb: game.thumb,
        normal_price: game.cheapest ?? "0",
        current_price: game.cheapest ?? "0",
        notify_on_sale: true,
      });
      onWishlistChange(game.gameID, true);
    }
    setLoading(false);
  };

  const cheapNum = parseFloat(game.cheapest ?? "0");
  const priceLabel = cheapNum === 0 ? t("free") : `$${cheapNum.toFixed(2)}`;

  return (
    <div className="group card card-hover flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-slate-900/50 aspect-[16/7]">
        <Image
          src={game.thumb}
          alt={game.external}
          fill
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Wishlist button */}
        <button
          onClick={toggle}
          disabled={loading}
          className={clsx(
            "absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all shadow-lg",
            game.inWishlist
              ? "bg-red-500/90 text-white opacity-100"
              : "bg-black/50 text-slate-300 hover:bg-black/70 hover:text-red-400 opacity-0 group-hover:opacity-100"
          )}
          title={game.inWishlist ? t("removeWishlist") : t("addWishlist")}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : game.inWishlist ? (
            <Heart className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Bell className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-sm text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {game.external}
        </h3>

        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="flex items-center gap-1.5">
            <span className={clsx(
              "text-xs font-semibold px-2 py-0.5 rounded-lg",
              cheapNum === 0 ? "bg-amber-500/15 text-amber-400" : "bg-slate-800 text-slate-300"
            )}>
              {cheapNum === 0 ? t("free") : t("lowestEver", { price: priceLabel })}
            </span>
          </div>

          <Link
            href={`/${locale}/game/${game.gameID}`}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors flex-shrink-0"
          >
            {t("comparePrices")}
          </Link>
        </div>

        {/* Wishlist status bar */}
        {game.inWishlist && (
          <div className="flex items-center gap-1.5 text-xs text-purple-400/70 border-t border-white/5 pt-2 mt-1">
            <Bell className="w-3 h-3" />
            {t("notifyHint")}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameBrowseClient() {
  const t = useTranslations("browse");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 400);

  // Load user wishlist IDs on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("wishlist").select("game_id").eq("user_id", user.id);
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((row) => { map[row.game_id] = true; });
        setWishlistMap(map);
      }
    });
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`/api/games?title=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setSearched(true);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleWishlistChange = (gameID: string, added: boolean) => {
    setWishlistMap((prev) => ({ ...prev, [gameID]: added }));
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const enriched = results.map((g) => ({ ...g, inWishlist: !!wishlistMap[g.gameID] }));

  return (
    <div>
      {/* Search box */}
      <div className="relative max-w-2xl mb-8">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all text-sm"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Empty state */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
            <GamepadIcon className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-1">{t("emptyTitle")}</p>
          <p className="text-slate-600 text-sm">{t("emptyDesc")}</p>
        </div>
      )}

      {/* No results */}
      {searched && results.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-400 font-medium mb-1">{t("noResults")}</p>
          <p className="text-slate-600 text-sm">{t("noResultsDesc")}</p>
        </div>
      )}

      {/* Results count */}
      {enriched.length > 0 && (
        <p className="text-slate-500 text-sm mb-4">
          {t("resultsCount", { count: enriched.length, query: debouncedQuery })}
        </p>
      )}

      {/* Results grid */}
      {enriched.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {enriched.map((game) => (
            <GameCard key={game.gameID} game={game} onWishlistChange={handleWishlistChange} />
          ))}
        </div>
      )}
    </div>
  );
}
