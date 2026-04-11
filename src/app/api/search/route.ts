import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageSearch } from "@/lib/ai-search";
import { getDeals, searchGames, deduplicateDeals } from "@/lib/cheapshark";
import type { Deal } from "@/types";

type SearchFilters = {
  title?: string;
  maxPrice?: number | null;
  minMetacritic?: number | null;
  storeID?: string | null;
  sortBy?: string;
  onSale?: boolean;
};

// "similar" modunda: AI'ın önerdiği her oyun başlığı için CheapShark'ta fırsat ara
async function fetchDealsByTitles(titles: string[], filters: SearchFilters): Promise<Deal[]> {
  const results = await Promise.all(
    titles.map((title) =>
      getDeals({
        title,
        upperPrice: filters.maxPrice ?? undefined,
        metacritic: filters.minMetacritic ?? undefined,
        storeID: filters.storeID ?? undefined,
        sortBy: filters.sortBy ?? "Deal Rating",
        onSale: filters.onSale ?? true,
        pageSize: 5,
      }).catch(() => [] as Deal[])
    )
  );

  // Her oyundan en iyi 1 deal al, sonra dedup yap
  const candidates: Deal[] = [];
  for (const dealList of results) {
    if (dealList.length > 0) candidates.push(dealList[0]);
  }
  return deduplicateDeals(candidates);
}

// "similar" modunda yeterli sonuç yoksa searchGames ile tamamla (indirimde olmasa da)
async function fetchGameInfoByTitles(titles: string[], filters: SearchFilters): Promise<Deal[]> {
  const maxPrice = filters.maxPrice ?? undefined;
  const results = await Promise.all(
    titles.map((title) => searchGames(title).catch(() => []))
  );

  const seen = new Set<string>();
  const deals: Deal[] = [];
  for (const list of results) {
    const game = list.find((item) => {
      if (seen.has(item.gameID)) return false;
      if (maxPrice !== undefined && parseFloat(item.cheapest) > maxPrice) return false;
      return true;
    }) ?? list[0];

    if (!game || seen.has(game.gameID)) continue;
    if (maxPrice !== undefined && parseFloat(game.cheapest) > maxPrice) continue;
    seen.add(game.gameID);
    deals.push({
      internalName: game.internalName,
      title: game.external,
      metacriticLink: null,
      dealID: game.cheapestDealID ?? "",
      storeID: "1",
      gameID: game.gameID,
      salePrice: game.cheapest,
      normalPrice: game.cheapest,
      isOnSale: "0",
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
    });
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
      // Önce indirimli olanları getir
      deals = await fetchDealsByTitles(parsed.gameTitles, filters);

      // Az sonuç varsa indirimde olmayanlarla da tamamla
      if (deals.length < 6) {
        const extras = await fetchGameInfoByTitles(
          parsed.gameTitles.filter((t) => !deals.some((d) => d.title.toLowerCase().includes(t.toLowerCase()))),
          filters
        );
        const combined = deduplicateDeals([...deals, ...extras]);
        deals = combined.slice(0, 24);
      }
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
