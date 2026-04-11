import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { parseNaturalLanguageSearch } from "@/lib/ai-search";
import type { AISearchResponse } from "@/types";

async function computeSearchResponse(query: string, locale?: string) {
  const parsed = await parseNaturalLanguageSearch(query, locale) as AISearchResponse;

  return {
    interpretation: parsed.interpretation,
    query,
    searchMode: parsed.searchMode,
    gameTitles: parsed.gameTitles ?? [],
    filters: parsed.filters ?? {},
    deals: [],
  };
}

const getCachedSearchResponse = unstable_cache(
  async (query: string, locale?: string) => computeSearchResponse(query, locale),
  ["ai-search-response"],
  { revalidate: 60 * 30 }
);

export async function POST(req: NextRequest) {
  const { query, locale } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });

  try {
    const response = await getCachedSearchResponse(query.trim(), locale);
    return NextResponse.json(response);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({
      interpretation: locale === "tr" ? `"${query}" icin sonuc bulunamadi.` : `No results found for "${query}".`,
      query,
      searchMode: "deals",
      deals: [],
      error: "Search failed",
    }, { status: 200 });
  }
}
