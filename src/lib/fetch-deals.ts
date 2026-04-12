const CHEAPSHARK = "https://www.cheapshark.com/api/1.0";

/**
 * Fetch from CheapShark directly (browser → API, best for CORS-enabled endpoints).
 * If that fails (timeout, CORS block, API down), fall back to our own API route proxy
 * which has hardcoded fallback data.
 */
async function fetchWithFallback(
  directUrl: string,
  proxyUrl: string,
  timeoutMs = 8000,
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(directUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) return res;
  } catch {
    // direct call failed — try proxy
  }

  return fetch(proxyUrl);
}

export async function fetchDeals(params?: URLSearchParams): Promise<unknown> {
  const qs = params ? `?${params}` : "";
  const res = await fetchWithFallback(
    `${CHEAPSHARK}/deals${qs}`,
    `/api/deals${qs}`,
  );
  return res.json();
}

export async function fetchStores(): Promise<unknown> {
  const res = await fetchWithFallback(
    `${CHEAPSHARK}/stores`,
    `/api/stores`,
  );
  return res.json();
}

export async function fetchGameInfo(id: string): Promise<unknown> {
  const res = await fetchWithFallback(
    `${CHEAPSHARK}/games?id=${id}`,
    `/api/game?id=${id}`,
  );
  return res.json();
}

export async function fetchGameSearch(title: string, limit = 20): Promise<unknown> {
  const qs = `?title=${encodeURIComponent(title)}&limit=${limit}`;
  const res = await fetchWithFallback(
    `${CHEAPSHARK}/games${qs}`,
    `/api/games${qs}`,
  );
  return res.json();
}

export { CHEAPSHARK };
