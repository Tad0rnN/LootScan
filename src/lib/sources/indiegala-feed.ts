import { XMLParser } from "fast-xml-parser";

const UA = "Mozilla/5.0 (compatible; LootScanBot/1.0; +https://lootscan.co)";
const BASE_URL = "https://www.indiegala.com/store_games_rss";
const PAGE_CONCURRENCY = 10;

export interface IndiegalaFeedRow {
  sku: string;
  title: string;
  price: number;
  price_base: number;
  currency: string;
  link: string;
  publisher: string | null;
  is_dlc: boolean;
  thumb: string | null;
  is_available: boolean;
}

interface RawFeedResponse {
  rss?: {
    channel?: {
      totalPages?: number;
      browse?: {
        item?: RawItem | RawItem[];
      };
    };
  };
}

interface RawItem {
  title?: string;
  sku?: string;
  link?: string;
  publisher?: string;
  priceUSD?: number | string;
  discountPriceUSD?: number | string;
  isDLC?: string | number | boolean;
  state?: string;
  boximg?: string;
}

const parser = new XMLParser();

function toFeedRow(item: RawItem): IndiegalaFeedRow | null {
  if (!item.sku || !item.title || !item.link) return null;

  return {
    sku: item.sku,
    title: item.title,
    price: Number(item.discountPriceUSD ?? item.priceUSD) || 0,
    price_base: Number(item.priceUSD) || 0,
    currency: "USD",
    link: item.link,
    publisher: item.publisher ?? null,
    is_dlc: !["None", ""].includes(String(item.isDLC ?? "None").trim()),
    thumb: item.boximg ? `https://www.indiegala.com/${item.boximg}` : null,
    is_available: item.state !== "unavailable",
  };
}

async function fetchPage(page: number): Promise<{ items: RawItem[]; totalPages: number }> {
  const res = await fetch(`${BASE_URL}?page=${page}`, {
    headers: { "User-Agent": UA, Accept: "application/xml" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`IndieGala RSS page ${page} returned ${res.status}`);

  const xml = await res.text();
  const parsed = parser.parse(xml) as RawFeedResponse;
  const channel = parsed.rss?.channel;
  const rawItems = channel?.browse?.item;
  const items: RawItem[] = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
  return { items, totalPages: channel?.totalPages ?? 1 };
}

export async function fetchIndiegalaFeed(): Promise<IndiegalaFeedRow[]> {
  const first = await fetchPage(1);
  const rows: IndiegalaFeedRow[] = [];
  for (const item of first.items) {
    const row = toFeedRow(item);
    if (row) rows.push(row);
  }

  const remainingPages = Array.from(
    { length: Math.max(first.totalPages - 1, 0) },
    (_, i) => i + 2
  );

  for (let i = 0; i < remainingPages.length; i += PAGE_CONCURRENCY) {
    const batch = remainingPages.slice(i, i + PAGE_CONCURRENCY);
    const results = await Promise.all(batch.map((page) => fetchPage(page)));
    for (const result of results) {
      for (const item of result.items) {
        const row = toFeedRow(item);
        if (row) rows.push(row);
      }
    }
  }

  // The RSS feed occasionally lists the same sku twice — the catalog can
  // shift between page fetches during the ~40s it takes to page through all
  // 19 pages, so an item near a page boundary sometimes appears on both
  // sides. Dedupe by sku (keep the last-seen row) so a single upsert batch
  // never contains the same primary key twice.
  const bySku = new Map<string, IndiegalaFeedRow>();
  for (const row of rows) bySku.set(row.sku, row);
  return Array.from(bySku.values());
}
