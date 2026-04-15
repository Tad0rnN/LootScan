import {
  fallbackDeals,
  fallbackStores,
  getFallbackDeals,
  searchFallbackGames,
  getFallbackGameInfo,
} from "./fallback-data";

/**
 * Client-side fetchers.
 *
 * IMPORTANT: we NEVER call CheapShark directly from the browser anymore.
 * Hitting CheapShark from every user's IP gets us 429'd fast and there's
 * no shared cache. Everything now goes through our own /api proxy, which
 * caches in-memory + on the edge and falls back to local data if needed.
 */
async function tryFetch(
  url: string,
  timeoutMs = 12_000
): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) return res;
  } catch {
    // swallowed — fall through to local fallback
  }
  return null;
}

export async function fetchDeals(
  params?: URLSearchParams
): Promise<unknown> {
  const qs = params ? `?${params}` : "";
  const res = await tryFetch(`/api/deals${qs}`);
  if (res) return res.json();

  const p = params ? Object.fromEntries(params.entries()) : {};
  return getFallbackDeals(p);
}

export async function fetchStores(): Promise<unknown> {
  const res = await tryFetch(`/api/stores`);
  if (res) return res.json();
  return fallbackStores;
}

export async function fetchGameInfo(id: string): Promise<unknown> {
  const res = await tryFetch(`/api/game?id=${encodeURIComponent(id)}`);
  if (res) return res.json();
  return getFallbackGameInfo(id);
}

export async function fetchGameSearch(
  title: string,
  limit = 20
): Promise<unknown> {
  const qs = `?title=${encodeURIComponent(title)}&limit=${limit}`;
  const res = await tryFetch(`/api/games${qs}`);
  if (res) return res.json();
  return searchFallbackGames(title);
}

export { fallbackDeals };
// Keep legacy export name to avoid breaking imports.
export const CHEAPSHARK = "/api";
