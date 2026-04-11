import type { Deal, Store, GameInfo, SearchResult } from "@/types";

const BASE_URL = "https://www.cheapshark.com/api/1.0";

export async function getDeals(params: {
  storeID?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  title?: string;
  upperPrice?: number;
  lowerPrice?: number;
  metacritic?: number;
  steamworks?: boolean;
  onSale?: boolean;
  steamRating?: number;
} = {}): Promise<Deal[]> {
  const query = new URLSearchParams();
  query.set("pageSize", String(params.pageSize ?? 24));
  query.set("pageNumber", String(params.pageNumber ?? 0));
  if (params.storeID) query.set("storeID", params.storeID);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.title) query.set("title", params.title);
  if (params.upperPrice !== undefined) query.set("upperPrice", String(params.upperPrice));
  if (params.lowerPrice !== undefined) query.set("lowerPrice", String(params.lowerPrice));
  if (params.metacritic) query.set("metacritic", String(params.metacritic));
  if (params.steamworks) query.set("steamworks", "1");
  if (params.onSale) query.set("onSale", "1");
  if (params.steamRating) query.set("steamRating", String(params.steamRating));

  const res = await fetch(`${BASE_URL}/deals?${query}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error("Failed to fetch deals");
  return res.json();
}

export async function getStores(): Promise<Store[]> {
  const res = await fetch(`${BASE_URL}/stores`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
}

export async function getGameInfo(gameID: string): Promise<GameInfo> {
  const res = await fetch(`${BASE_URL}/games?id=${gameID}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error("Failed to fetch game info");
  return res.json();
}

export async function searchGames(title: string): Promise<SearchResult[]> {
  const res = await fetch(`${BASE_URL}/games?title=${encodeURIComponent(title)}&limit=20`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error("Failed to search games");
  return res.json();
}

function normalizeGameName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function findGameBySteamAppIdOrTitle(params: {
  title: string;
  steamAppID?: string | number | null;
}): Promise<SearchResult | null> {
  const results = await searchGames(params.title);
  const steamAppID = params.steamAppID ? String(params.steamAppID) : null;

  if (steamAppID) {
    const exactSteamMatch = results.find((result) => result.steamAppID === steamAppID);
    if (exactSteamMatch) return exactSteamMatch;
  }

  const normalizedTitle = normalizeGameName(params.title);
  return results.find((result) => {
    return normalizeGameName(result.external) === normalizedTitle
      || normalizeGameName(result.internalName) === normalizedTitle;
  }) ?? null;
}

export function getStoreLogoUrl(storeID: string): string {
  return `https://www.cheapshark.com/img/stores/icons/${parseInt(storeID) - 1}.png`;
}

export function formatPrice(price: string | number): string {
  const num = parseFloat(String(price));
  if (num === 0) return "FREE";
  return `$${num.toFixed(2)}`;
}

export function formatSavings(savings: string | number): string {
  return `${Math.round(parseFloat(String(savings)))}%`;
}

// Her oyundan sadece en ucuz deal'i tut
export function deduplicateDeals(deals: Deal[]): Deal[] {
  const map = new Map<string, Deal>();
  for (const deal of deals) {
    const existing = map.get(deal.gameID);
    if (!existing || parseFloat(deal.salePrice) < parseFloat(existing.salePrice)) {
      map.set(deal.gameID, deal);
    }
  }
  return Array.from(map.values());
}
