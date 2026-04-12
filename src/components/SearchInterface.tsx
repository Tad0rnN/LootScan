"use client";

import { useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import DealCard from "./DealCard";
import type { AISearchResponse, Deal, SearchResult } from "@/types";
import { useLocale, useTranslations } from "next-intl";

interface SearchState {
  interpretation: string;
  query: string;
  searchMode?: "similar" | "deals";
  gameTitles?: string[];
  filters?: AISearchResponse["filters"];
  deals: Deal[];
  rateLimited?: boolean;
}

const MAX_SIMILAR_RESULTS = 8;
const EXCLUDED_TITLE_TERMS = [
  "soundtrack",
  "artbook",
  "art book",
  "art of",
  "dlc",
  "season pass",
  "expansion",
  "portrait pack",
  "costume pack",
  "skin pack",
  "weapon pack",
];

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isBaseGameTitle(value: string): boolean {
  const normalized = normalizeText(value);
  return !EXCLUDED_TITLE_TERMS.some((term) => normalized.includes(normalizeText(term)));
}

function deduplicateDeals(deals: Deal[]): Deal[] {
  const map = new Map<string, Deal>();
  for (const deal of deals) {
    const existing = map.get(deal.gameID);
    if (!existing || parseFloat(deal.salePrice) < parseFloat(existing.salePrice)) {
      map.set(deal.gameID, deal);
    }
  }
  return Array.from(map.values());
}

function toDeal(game: SearchResult): Deal {
  return {
    internalName: game.internalName,
    title: game.external,
    metacriticLink: null,
    dealID: game.cheapestDealID ?? `search-${game.gameID}`,
    storeID: "1",
    gameID: game.gameID,
    salePrice: game.cheapest,
    normalPrice: game.cheapest,
    isOnSale: game.cheapestDealID ? "1" : "0",
    savings: "0",
    metacriticScore: "0",
    steamRatingText: null,
    steamRatingPercent: "0",
    steamRatingCount: "0",
    steamAppID: game.steamAppID ?? null,
    releaseDate: 0,
    lastChange: 0,
    dealRating: "0",
    thumb: game.thumb,
  };
}

async function fetchDealsMode(filters: AISearchResponse["filters"] | undefined): Promise<Deal[]> {
  const params = new URLSearchParams();
  if (filters?.title) params.set("title", filters.title);
  if (filters?.maxPrice !== undefined && filters.maxPrice !== null) params.set("upperPrice", String(filters.maxPrice));
  if (filters?.minMetacritic !== undefined && filters.minMetacritic !== null) params.set("metacritic", String(filters.minMetacritic));
  if (filters?.storeID) params.set("storeID", filters.storeID);
  params.set("sortBy", filters?.sortBy ?? "Deal Rating");
  if (filters?.onSale ?? true) params.set("onSale", "1");
  params.set("pageSize", "24");

  const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?${params}`);
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) return [];
  const data = await res.json();
  return deduplicateDeals(Array.isArray(data) ? data : []).slice(0, 24);
}

function pickBestSearchResult(results: SearchResult[], title: string, filters: AISearchResponse["filters"] | undefined, seen: Set<string>): SearchResult | null {
  const normalizedTitle = normalizeText(title);
  const maxPrice = filters?.maxPrice ?? undefined;

  const candidates = results.filter((item) => {
    if (seen.has(item.gameID)) return false;
    if (!isBaseGameTitle(item.external)) return false;
    if (maxPrice !== undefined && maxPrice !== null && parseFloat(item.cheapest) > maxPrice) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  return candidates.find((item) => normalizeText(item.external) === normalizedTitle)
    ?? candidates.find((item) => normalizeText(item.internalName) === normalizedTitle)
    ?? candidates[0];
}

async function fetchSimilarMode(gameTitles: string[], filters: AISearchResponse["filters"] | undefined): Promise<Deal[]> {
  const seen = new Set<string>();
  const deals: Deal[] = [];

  for (const title of gameTitles.slice(0, MAX_SIMILAR_RESULTS)) {
    const res = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}`);
    if (res.status === 429) throw new Error("rate_limited");
    if (!res.ok) continue;
    const data = await res.json();
    const results = Array.isArray(data) ? data as SearchResult[] : [];
    const game = pickBestSearchResult(results, title, filters, seen);
    if (!game) continue;
    seen.add(game.gameID);
    deals.push(toDeal(game));
  }

  return deduplicateDeals(deals).slice(0, MAX_SIMILAR_RESULTS);
}

export default function SearchInterface() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("search");
  const exampleQueries = [
    t("example1"),
    t("example2"),
    t("example3"),
    t("example4"),
    t("example5"),
    t("example6"),
  ];

  const search = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setInput(query);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, locale }),
      });

      if (!res.ok) {
        throw new Error(t("errorGeneric"));
      }

      const data: SearchState = await res.json();
      let deals: Deal[] = [];
      let rateLimited = false;

      try {
        deals = data.searchMode === "similar"
          ? await fetchSimilarMode(data.gameTitles ?? [], data.filters)
          : await fetchDealsMode(data.filters);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.message === "rate_limited") {
          rateLimited = true;
        } else {
          throw fetchError;
        }
      }

      setResult({
        ...data,
        deals,
        rateLimited,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search box */}
      <div className="card p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="input w-full pl-10"
              placeholder={t("placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search(input)}
            />
          </div>
          <button
            onClick={() => search(input)}
            disabled={loading || !input.trim()}
            className="btn-primary flex items-center gap-2 px-5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {t("button")}
          </button>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2 mt-3">
          {exampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => search(q)}
              className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-colors border border-slate-700 hover:border-slate-600"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-3" />
          <p className="text-slate-400">{t("analyzing")}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-6 border-red-500/30 bg-red-500/5 text-red-400">
          <strong>{t("errorTitle")}:</strong> {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* AI interpretation */}
          <div className="card p-4 mb-6 bg-purple-500/5 border-purple-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-purple-300 font-medium">{t("aiInterpretation")}</p>
                <p className="text-slate-300 text-sm mt-1">{result.interpretation}</p>
              </div>
            </div>
          </div>

          {result.deals.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>{t("noDeals")}</p>
              <p className="text-sm mt-1">
                {result.gameTitles && result.gameTitles.length > 0
                  ? (result.rateLimited ? t("rateLimitedHint") : t("suggestionsOnlyHint"))
                  : t("noDealsDesc")}
              </p>

              {result.gameTitles && result.gameTitles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-left">
                  {result.gameTitles.slice(0, MAX_SIMILAR_RESULTS).map((title) => (
                    <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-medium text-white">{title}</p>
                      <p className="text-xs text-slate-500 mt-1">{t("aiSuggestionLabel")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-sm mb-4">{t("dealsFound", { count: result.deals.length, query: result.query })}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.deals.map((deal) => (
                  <DealCard key={deal.dealID} deal={deal} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
