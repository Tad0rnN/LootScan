import type { Deal, Store, GameInfo, SearchResult } from "@/types";

const BASE_URL = "https://www.cheapshark.com/api/1.0";

async function fetchCheapShark<T>(path: string, revalidate: number): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        next: { revalidate },
        signal: AbortSignal.timeout(15000),
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`CheapShark request failed with ${res.status}`);
      }

      return res.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("CheapShark request failed");
}

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

  return fetchCheapShark<Deal[]>(`/deals?${query}`, 300);
}

export async function getStores(): Promise<Store[]> {
  return fetchCheapShark<Store[]>("/stores", 3600);
}

export async function getGameInfo(gameID: string): Promise<GameInfo> {
  return fetchCheapShark<GameInfo>(`/games?id=${gameID}`, 300);
}

export async function searchGames(title: string): Promise<SearchResult[]> {
  return fetchCheapShark<SearchResult[]>(`/games?title=${encodeURIComponent(title)}&limit=20`, 60);
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
