import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageSearch } from "@/lib/ai-search";
import { getDeals, searchGames, deduplicateDeals } from "@/lib/cheapshark";
import type { Deal, SearchResult } from "@/types";

type SearchFilters = {
  title?: string;
  maxPrice?: number | null;
  minMetacritic?: number | null;
  storeID?: string | null;
  sortBy?: string;
  onSale?: boolean;
};

const MAX_SIMILAR_RESULTS = 8;
const EXCLUDED_TITLE_TERMS = [
  "soundtrack",
  "artbook",
  "art book",
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

function toDeal(game: SearchResult): Deal {
  return {
    internalName: game.internalName,
    title: game.external,
    metacriticLink: null,
    dealID: game.cheapestDealID ?? "",
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

function pickBestSearchResult(results: SearchResult[], title: string, filters: SearchFilters, seen: Set<string>): SearchResult | null {
  const normalizedTitle = normalizeText(title);
  const maxPrice = filters.maxPrice ?? undefined;

  const candidates = results.filter((item) => {
    if (seen.has(item.gameID)) return false;
    if (maxPrice !== undefined && parseFloat(item.cheapest) > maxPrice) return false;
    if (!isBaseGameTitle(item.external)) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  return candidates.find((item) => normalizeText(item.external) === normalizedTitle)
    ?? candidates.find((item) => normalizeText(item.internalName) === normalizedTitle)
    ?? candidates[0];
}

async function fetchSimilarDeals(titles: string[], filters: SearchFilters): Promise<Deal[]> {
  const selectedTitles = titles.slice(0, MAX_SIMILAR_RESULTS);
  const seen = new Set<string>();
  const deals: Deal[] = [];

  for (const title of selectedTitles) {
    const results = await searchGames(title).catch(() => [] as SearchResult[]);
    const game = pickBestSearchResult(results, title, filters, seen);
    if (!game) continue;
    seen.add(game.gameID);
    deals.push(toDeal(game));
  }

  return deals;
}

export async function POST(req: NextRequest) {
  const { query, locale } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });

  let parsed;
  try {
    parsed = await parseNaturalLanguageSearch(query, locale);
  } catch (error) {
    console.warn("AI search parser failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  try {
    let deals: Deal[] = [];
    const filters = (parsed.filters ?? {}) as SearchFilters;

    if (parsed.searchMode === "similar" && parsed.gameTitles?.length > 0) {
      deals = deduplicateDeals(await fetchSimilarDeals(parsed.gameTitles, filters)).slice(0, MAX_SIMILAR_RESULTS);
    } else {
      // deals modu: normal filtre araması
      const raw = await getDeals({
        title: filters.title,
        upperPrice: filters.maxPrice ?? undefined,
        metacritic: filters.minMetacritic ?? undefined,
        storeID: filters.storeID ?? undefined,
        sortBy: filters.sortBy ?? "Deal Rating",
        onSale: filters.onSale ?? true,
        pageSize: 60,
      });
      deals = deduplicateDeals(raw).slice(0, 24);
    }

    return NextResponse.json({
      interpretation: parsed.interpretation,
      query,
      searchMode: parsed.searchMode,
      deals,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({
      interpretation: parsed.interpretation,
      query,
      searchMode: parsed.searchMode,
      deals: [],
      error: "Search failed",
    }, { status: 200 });
  }
}
