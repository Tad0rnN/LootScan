import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageSearch } from "@/lib/groq";
import { getDeals, deduplicateDeals } from "@/lib/cheapshark";

function extractFallbackFilters(query: string) {
  const q = query.toLowerCase();

  const maxPriceMatch = q.match(/(?:under|below|max|less than|at most)\s*\$?(\d+(?:\.\d+)?)/);
  const maxPrice = maxPriceMatch ? parseFloat(maxPriceMatch[1]) : undefined;

  const metacriticMatch = q.match(/(\d{2,3})\+?\s*(?:metacritic|meta|score|rating)/);
  const minMetacritic = metacriticMatch ? parseInt(metacriticMatch[1]) : undefined;

  const isFree = /\bfree\b/.test(q);

  const storeMap: Record<string, string> = {
    steam: "1", gog: "7", epic: "27", humble: "11",
    fanatical: "15", origin: "8", ea: "8",
  };
  let storeID: string | undefined;
  for (const [name, id] of Object.entries(storeMap)) {
    if (q.includes(name)) { storeID = id; break; }
  }

  const sortMap: Array<[RegExp, string]> = [
    [/cheapest|lowest price|price/, "Price"],
    [/biggest.*discount|most.*off|saving/, "Savings"],
    [/top rated|best rated|highest.*rating|metacritic/, "Metacritic"],
    [/new|recent|latest/, "recent"],
    [/review/, "Reviews"],
  ];
  let sortBy = "Deal Rating";
  for (const [re, sort] of sortMap) {
    if (re.test(q)) { sortBy = sort; break; }
  }

  // Extract title keywords (remove filter words)
  const stopWords = /\b(cheap|free|best|good|great|top|new|recent|latest|under|below|above|game|games|deals?|discount|sale|on sale|steam|gog|epic|humble|fanatical|rated|rating|metacritic|score|\$\d+|\d+\$|\d+\s*dollars?)\b/gi;
  const title = query.replace(stopWords, " ").replace(/\s+/g, " ").trim() || undefined;

  return {
    interpretation: `Searching for games matching "${query}"`,
    query,
    filters: {
      title: title && title.length > 2 ? title : undefined,
      maxPrice: isFree ? 0 : maxPrice,
      minMetacritic,
      storeID,
      sortBy,
      onSale: !isFree,
    },
  };
}

export async function POST(req: NextRequest) {
  const { query, locale } = await req.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  let parsed;
  let usedAI = false;

  try {
    parsed = await parseNaturalLanguageSearch(query);
    usedAI = true;
  } catch (error) {
    console.warn("Gemini unavailable, using fallback parser:", error);
    parsed = extractFallbackFilters(query);
  }

  try {
    const rawDeals = await getDeals({
      title: parsed.filters.title,
      upperPrice: parsed.filters.maxPrice,
      metacritic: parsed.filters.minMetacritic,
      storeID: parsed.filters.storeID,
      sortBy: parsed.filters.sortBy ?? "Deal Rating",
      onSale: parsed.filters.onSale ?? true,
      steamworks: (parsed.filters as { steamworks?: boolean }).steamworks,
      pageSize: 60,
    });
    const deals = deduplicateDeals(rawDeals).slice(0, 24);
    const fallbackNoticeByLocale: Record<string, string> = {
      tr: "AI gecici olarak kullanilamiyor, akilli arama aktif",
      en: "AI is temporarily unavailable, smart search is active",
      de: "KI ist voruebergehend nicht verfuegbar, intelligente Suche ist aktiv",
      nl: "AI is tijdelijk niet beschikbaar, slim zoeken is actief",
      ja: "AIは一時的に利用できません。スマート検索を使用しています",
      zh: "AI 当前暂时不可用，已启用智能搜索",
    };
    const fallbackNotice = fallbackNoticeByLocale[locale] ?? fallbackNoticeByLocale.en;

    return NextResponse.json({
      interpretation: parsed.interpretation + (!usedAI ? ` (${fallbackNotice})` : ""),
      query: parsed.query,
      deals: deals,
    });
  } catch (error) {
    console.error("Deal fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}
