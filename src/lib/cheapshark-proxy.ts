/**
 * Server-side helper for talking to CheapShark reliably.
 *
 * Problems we solve:
 *  - CheapShark rate limits (429) when hit too fast
 *  - Anonymous UA gets limited more aggressively
 *  - Same request repeated many times per minute
 *
 * Strategy:
 *  - In-memory LRU-ish cache with TTL (survives within a server instance)
 *  - Real User-Agent header
 *  - Retry once on 429 with short backoff
 *  - Timeout via AbortSignal
 */

type CacheEntry = { expires: number; data: unknown };
const cache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 500;

function cacheGet(key: string): unknown | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  // refresh recency
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

function cacheSet(key: string, data: unknown, ttlMs: number) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { expires: Date.now() + ttlMs, data });
}

const UA =
  "Mozilla/5.0 (compatible; LootScanBot/1.0; +https://lootscan.co)";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch a CheapShark URL with:
 *  - in-memory cache (ttlMs)
 *  - browser-like User-Agent
 *  - one retry on 429 / 5xx with small backoff
 *  - timeout (default 10s)
 *
 * Returns parsed JSON or throws.
 */
export async function fetchCheapShark<T = unknown>(
  url: string,
  opts: { ttlMs?: number; timeoutMs?: number } = {}
): Promise<T> {
  const ttlMs = opts.ttlMs ?? 5 * 60 * 1000; // 5 min default
  const timeoutMs = opts.timeoutMs ?? 10_000;

  const cached = cacheGet(url);
  if (cached !== undefined) return cached as T;

  const doFetch = async (): Promise<Response> => {
    return fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
      },
      // Let Next cache on the edge too when possible
      next: { revalidate: Math.floor(ttlMs / 1000) },
    });
  };

  let res = await doFetch();

  // Retry once on transient failures
  if (!res.ok && (res.status === 429 || res.status >= 500)) {
    await sleep(700);
    res = await doFetch();
  }

  if (!res.ok) {
    throw new Error(`CheapShark ${res.status} for ${url}`);
  }

  const data = (await res.json()) as T;
  cacheSet(url, data, ttlMs);
  return data;
}

export const CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0";
