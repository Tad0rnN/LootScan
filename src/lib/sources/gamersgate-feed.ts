const UA = "Mozilla/5.0 (compatible; LootScanBot/1.0; +https://lootscan.co)";
const BASE_URL = "https://www.gamersgate.com";
const PAGE_CONCURRENCY = 15;

export interface GamersgateFeedRow {
  id: number;
  sku: string;
  title: string;
  price: number;
  price_base: number;
  currency: string;
  link: string;
  publisher: string | null;
  thumb: string | null;
  is_available: boolean;
}

interface RawOffersResponse {
  catalog: RawCatalogItem[];
  number_of_pages: number;
}

interface RawCatalogItem {
  id?: number;
  sku?: string;
  name?: string;
  vendor_name?: string;
  image?: string;
  link?: string;
  baseprice?: string;
  raw_price?: string;
  currency_code?: string;
  is_available?: boolean;
}

function parseBasePrice(baseprice: string | undefined): number {
  if (!baseprice) return 0;
  // Strip HTML entities first (e.g. "&#8364;") — their numeric codepoints
  // would otherwise get swept up by the digit-only filter below.
  const withoutEntities = baseprice.replace(/&#?\w+;/g, "");
  const numeric = withoutEntities.replace(/[^0-9.]/g, "");
  return Number(numeric) || 0;
}

function toFeedRow(item: RawCatalogItem): GamersgateFeedRow | null {
  if (!item.id || !item.name || !item.link) return null;

  return {
    id: item.id,
    sku: item.sku ?? String(item.id),
    title: item.name,
    price: Number(item.raw_price) || 0,
    price_base: parseBasePrice(item.baseprice),
    currency: item.currency_code ?? "EUR",
    link: `${BASE_URL}${item.link}`,
    publisher: item.vendor_name ?? null,
    thumb: item.image ?? null,
    is_available: item.is_available ?? true,
  };
}

async function fetchOffersPage(page: number): Promise<RawOffersResponse> {
  const res = await fetch(`${BASE_URL}/api/offers/?page=${page}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GamersGate offers page ${page} returned ${res.status}`);
  return res.json() as Promise<RawOffersResponse>;
}

export async function fetchGamersgateFeed(): Promise<GamersgateFeedRow[]> {
  const first = await fetchOffersPage(1);
  const rows: GamersgateFeedRow[] = [];
  for (const item of first.catalog) {
    const row = toFeedRow(item);
    if (row) rows.push(row);
  }

  const remainingPages = Array.from(
    { length: Math.max(first.number_of_pages - 1, 0) },
    (_, i) => i + 2
  );

  for (let i = 0; i < remainingPages.length; i += PAGE_CONCURRENCY) {
    const batch = remainingPages.slice(i, i + PAGE_CONCURRENCY);
    const results = await Promise.all(batch.map((page) => fetchOffersPage(page)));
    for (const result of results) {
      for (const item of result.catalog) {
        const row = toFeedRow(item);
        if (row) rows.push(row);
      }
    }
  }

  return rows;
}
