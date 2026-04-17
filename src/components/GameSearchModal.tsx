"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, Bell, Loader2, X, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import type { SearchResult } from "@/types";
import { fetchGameSearch } from "@/lib/fetch-deals";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function ResultRow({
  game,
  inWishlist,
  onWishlistChange,
  onClose,
}: {
  game: SearchResult;
  inWishlist: boolean;
  onWishlistChange: (id: string, added: boolean) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const t = useTranslations("browse");

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = `/${locale}/auth/login`; setLoading(false); return; }
    if (inWishlist) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("game_id", game.gameID);
      onWishlistChange(game.gameID, false);
    } else {
      const cheapNum = parseFloat(game.cheapest ?? "0");
      await supabase.from("wishlist").upsert({
        user_id: user.id,
        game_id: game.gameID,
        locale,
        game_title: game.external,
        game_thumb: game.thumb,
        normal_price: String(cheapNum),
        current_price: String(cheapNum),
        notify_on_sale: true,
      });
      onWishlistChange(game.gameID, true);
    }
    setLoading(false);
  };

  const cheapNum = parseFloat(game.cheapest ?? "0");
  const priceLabel = cheapNum === 0 ? t("free") : `$${cheapNum.toFixed(2)}`;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group rounded-xl">
      {/* Thumb */}
      <div className="relative w-14 h-8 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
        <Image src={game.thumb} alt={game.external} fill className="object-cover" sizes="56px" />
      </div>

      {/* Title + price */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">
          {game.external}
        </p>
        <p className={clsx("text-xs font-semibold", cheapNum === 0 ? "text-amber-400" : "text-brand-400")}>
          {t("lowestEver", { price: priceLabel })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          href={`/${locale}/game/${game.gameID}`}
          onClick={onClose}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-400 transition-colors px-2 py-1 rounded-lg hover:bg-brand-500/10"
          title={t("comparePrices")}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("comparePrices")}</span>
        </Link>

        <button
          onClick={toggle}
          disabled={loading}
          title={inWishlist ? t("removeWishlist") : t("addWishlist")}
          className={clsx(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
            inWishlist
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "text-slate-600 hover:text-slate-300 hover:bg-white/5"
          )}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : inWishlist ? (
            <Heart className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Bell className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function GameSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 350);
  const t = useTranslations("browse");

  // Focus input on open
  useEffect(() => { inputRef.current?.focus(); }, []);

  // ESC to close
  const handleClose = useCallback(() => onClose(), [onClose]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  // Load wishlist
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("wishlist").select("game_id").eq("user_id", user.id);
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((r) => { map[r.game_id] = true; });
        setWishlistMap(map);
      }
    });
  }, []);

  // Search
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setSearched(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchGameSearch(debouncedQuery, 30)
      .then((data) => { if (!cancelled) { setResults(Array.isArray(data) ? data as SearchResult[] : []); setSearched(true); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleWishlistChange = (id: string, added: boolean) => {
    setWishlistMap((prev) => ({ ...prev, [id]: added }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-16 sm:pt-20 pointer-events-none">
        <div
          className="w-full max-w-xl bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
            {loading
              ? <Loader2 className="w-4.5 h-4.5 text-brand-400 animate-spin flex-shrink-0" />
              : <Search className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
            }
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none"
            />
            {query ? (
              <button onClick={() => setQuery("")} className="text-slate-600 hover:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleClose} className="text-slate-600 hover:text-slate-400 transition-colors text-xs border border-white/10 px-1.5 py-0.5 rounded">
                ESC
              </button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto py-2">
              <p className="px-4 pb-1 text-xs text-slate-600">
                {t("resultsCount", { count: results.length, query: debouncedQuery })}
              </p>
              {results.map((game) => (
                <ResultRow
                  key={game.gameID}
                  game={game}
                  inWishlist={!!wishlistMap[game.gameID]}
                  onWishlistChange={handleWishlistChange}
                  onClose={handleClose}
                />
              ))}
            </div>
          )}

          {/* Empty state when searched */}
          {searched && results.length === 0 && !loading && (
            <div className="py-10 text-center text-slate-500 text-sm">{t("noResults")}</div>
          )}

          {/* Hint when no query */}
          {!query && (
            <div className="py-8 text-center text-slate-600 text-sm">{t("emptyDesc")}</div>
          )}
        </div>
      </div>
    </>
  );
}
