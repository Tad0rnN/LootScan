import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageSearch } from "@/lib/groq";
import { getDeals, searchGames, deduplicateDeals } from "@/lib/cheapshark";
import type { Deal } from "@/types";

// "similar" modunda: AI'ın önerdiği her oyun başlığı için CheapShark'ta fırsat ara
async function fetchDealsByTitles(titles: string[]): Promise<Deal[]> {
  const results = await Promise.all(
    titles.map((title) =>
      getDeals({ title, pageSize: 5, sortBy: "Deal Rating" }).catch(() => [] as Deal[])
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
async function fetchGameInfoByTitles(titles: string[]): Promise<Deal[]> {
  const results = await Promise.all(
    titles.map((title) => searchGames(title).catch(() => []))
  );

  const seen = new Set<string>();
  const deals: Deal[] = [];
  for (const list of results) {
    const game = list[0];
    if (!game || seen.has(game.gameID)) continue;
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

function fallbackParse(query: string) {
  const q = query.toLowerCase();
  const maxPriceMatch = q.match(/(?:under|below|max|less than|at most|alti|altinda)\s*\$?(\d+(?:\.\d+)?)/);
  const maxPrice = maxPriceMatch ? parseFloat(maxPriceMatch[1]) : undefined;
  const isFree = /\bfree\b|\bbedava\b/.test(q);
  const storeMap: Record<string, string> = { steam: "1", gog: "7", epic: "27", humble: "11" };
  let storeID: string | undefined;
  for (const [name, id] of Object.entries(storeMap)) {
    if (q.includes(name)) { storeID = id; break; }
  }
  return {
    interpretation: `"${query}" için arama yapılıyor`,
    searchMode: "deals" as const,
    gameTitles: [],
    filters: { maxPrice: isFree ? 0 : maxPrice, storeID, sortBy: "Deal Rating", onSale: true },
  };
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });

  let parsed;
  try {
    parsed = await parseNaturalLanguageSearch(query);
  } catch {
    parsed = fallbackParse(query);
  }

  try {
    let deals: Deal[] = [];

    if (parsed.searchMode === "similar" && parsed.gameTitles?.length > 0) {
      // Önce indirimli olanları getir
      deals = await fetchDealsByTitles(parsed.gameTitles);

      // Az sonuç varsa indirimde olmayanlarla da tamamla
      if (deals.length < 6) {
        const extras = await fetchGameInfoByTitles(
          parsed.gameTitles.filter((t) => !deals.some((d) => d.title.toLowerCase().includes(t.toLowerCase())))
        );
        const combined = deduplicateDeals([...deals, ...extras]);
        deals = combined;
      }
    } else {
      // deals modu: normal filtre araması
      const f = (parsed.filters ?? {}) as { title?: string; maxPrice?: number | null; minMetacritic?: number | null; storeID?: string | null; sortBy?: string; onSale?: boolean };
      const raw = await getDeals({
        title: f.title,
        upperPrice: f.maxPrice ?? undefined,
        metacritic: f.minMetacritic ?? undefined,
        storeID: f.storeID ?? undefined,
        sortBy: f.sortBy ?? "Deal Rating",
        onSale: f.onSale ?? true,
        pageSize: 60,
      });
      deals = deduplicateDeals(raw).slice(0, 24);
    }

    return NextResponse.json({
      interpretation: parsed.interpretation,
      searchMode: parsed.searchMode,
      deals,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
