import { fallbackDeals, fallbackStores, getFallbackDeals, searchFallbackGames, getFallbackGameInfo } from "./fallback-data";

const CHEAPSHARK = "https://www.cheapshark.com/api/1.0";

/**
 * Try fetching from a URL with timeout. Returns the Response if ok, otherwise null.
 */
async function tryFetch(url: string, timeoutMs = 8000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) return res;
  } catch {
    // failed
  }
  return null;
}

/**
 * Fetch deals: CheapShark direct → API proxy → client-side fallback data
 */
export async function fetchDeals(params?: URLSearchParams): Promise<unknown> {
  const qs = params ? `?${params}` : "";

  // 1) Direct CheapShark
  const direct = await tryFetch(`${CHEAPSHARK}/deals${qs}`);
  if (direct) return direct.json();

  // 2) Own API proxy (has server-side fallback)
  const proxy = await tryFetch(`/api/deals${qs}`, 10000);
  if (proxy) return proxy.json();

  // 3) Client-side fallback data
  const p = params ? Object.fromEntries(params.entries()) : {};
  return getFallbackDeals(p);
}

/**
 * Fetch stores: CheapShark direct → API proxy → client-side fallback
 */
export async function fetchStores(): Promise<unknown> {
  const direct = await tryFetch(`${CHEAPSHARK}/stores`);
  if (direct) return direct.json();

  const proxy = await tryFetch(`/api/stores`, 10000);
  if (proxy) return proxy.json();

  return fallbackStores;
}

/**
 * Fetch game info: CheapShark direct → API proxy → client-side fallback
 */
export async function fetchGameInfo(id: string): Promise<unknown> {
  const direct = await tryFetch(`${CHEAPSHARK}/games?id=${id}`);
  if (direct) return direct.json();

  const proxy = await tryFetch(`/api/game?id=${id}`, 10000);
  if (proxy) return proxy.json();

  return getFallbackGameInfo(id);
}

/**
 * Fetch game search: CheapShark direct → API proxy → client-side fallback
 */
export async function fetchGameSearch(title: string, limit = 20): Promise<unknown> {
  const qs = `?title=${encodeURIComponent(title)}&limit=${limit}`;

  const direct = await tryFetch(`${CHEAPSHARK}/games${qs}`);
  if (direct) return direct.json();

  const proxy = await tryFetch(`/api/games${qs}`, 10000);
  if (proxy) return proxy.json();

  return searchFallbackGames(title);
}

export { CHEAPSHARK, fallbackDeals };
