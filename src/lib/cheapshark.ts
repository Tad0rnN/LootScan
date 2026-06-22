import type { Deal, Store, GameInfo, SearchResult } from "@/types";
import { addAffiliateParam } from "@/lib/affiliate";
import {
  fetchCheapShark as fetchViaProxy,
  CHEAPSHARK_BASE,
} from "@/lib/cheapshark-proxy";

const BASE_URL = CHEAPSHARK_BASE;

// Uses the shared in-memory cache + UA + 429 retry from cheapshark-proxy
async function fetchCheapShark<T>(path: string, revalidate: number): Promise<T> {
  return fetchViaProxy<T>(`${BASE_URL}${path}`, {
    ttlMs: revalidate * 1000,
    timeoutMs: 15_000,
  });
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

/**
 * CheapShark store IDs for stores where we can construct direct URLs.
 * Stores NOT listed here fall back to the CheapShark redirect link.
 *
 * NOTE: CheapShark redirect returns HTTP 200 + JavaScript redirect (not 302),
 * so the "Location header" approach is impossible. For each store we want to
 * support, we must discover and hard-code their URL format manually.
 */
const STORE_URL_BUILDERS: Record<string, (title: string, steamAppID?: string | number | null) => string | null> = {
  "30": (title, steamAppID) => {
    // IndieGala: /store/game/[slug]/[steamAppID]  (steamAppID required — slug-only gives 302)
    if (!steamAppID) return null;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `https://www.indiegala.com/store/game/${slug}/${steamAppID}`;
  },
  "23": (title) => {
    if (!title) return "https://www.gamebillet.com/";
    const slug = title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
    return `https://www.gamebillet.com/${slug}`;
  },
  "27": () => "https://www.gamesplanet.com/",
  "2": (title) => {
    if (!title) return "https://www.gamersgate.com/";
    const slug = title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
    return `https://www.gamersgate.com/product/${slug}/`;
  },
};

export function getStoreLogoUrl(storeID: string): string {
  return `https://www.cheapshark.com/img/stores/icons/${parseInt(storeID) - 1}.png`;
}

/**
 * Returns the best URL for a deal.
 * - If we know the store's URL format → constructs it directly with affiliate param.
 * - Otherwise → falls back to the CheapShark redirect (no affiliate tracking possible).
 */
export function getDealUrl(
  dealID: string,
  storeID: string,
  title?: string,
  steamAppID?: string | number | null,
): string {
  const builder = STORE_URL_BUILDERS[storeID];
  if (builder && title) {
    const base = builder(title, steamAppID);
    if (base) return addAffiliateParam(base);
  }
  return `https://www.cheapshark.com/redirect?dealID=${dealID}`;
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
