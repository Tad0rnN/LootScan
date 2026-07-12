import { XMLParser } from "fast-xml-parser";

const UA = "Mozilla/5.0 (compatible; LootScanBot/1.0; +https://lootscan.co)";
const AFF_ID = "da4e3b6df6985a96c5550154b9207ed340684dd7";

export type GamersgateRegion = "USA" | "GBR" | "DEU" | "FRA" | "CAN" | "AUS";

export const GAMERSGATE_REGIONS: GamersgateRegion[] = ["USA", "GBR", "DEU", "FRA", "CAN", "AUS"];

export interface GamersgateFeedRow {
  sku: string;
  region: GamersgateRegion;
  title: string;
  price: number;
  price_base: number;
  currency: string;
  link: string;
  publisher: string | null;
  category: string | null;
  product_type: string | null;
  thumb: string | null;
  is_available: boolean;
}

interface RawFeedResponse {
  xml?: {
    currency?: string;
    item?: RawItem | RawItem[];
  };
}

interface RawItem {
  title?: string;
  sku?: string;
  link?: string;
  publisher?: string;
  categories?: string;
  type?: string;
  price?: number | string;
  srp?: number | string;
  state?: string;
  boximg_medium?: string;
}

const parser = new XMLParser();

function toFeedRow(item: RawItem, region: GamersgateRegion, currency: string): GamersgateFeedRow | null {
  if (!item.sku || !item.title || !item.link) return null;

  return {
    sku: item.sku,
    region,
    title: item.title,
    price: Number(item.price) || 0,
    price_base: Number(item.srp) || 0,
    currency,
    link: item.link,
    publisher: item.publisher ?? null,
    category: item.categories ?? null,
    product_type: item.type && item.type !== "None" ? item.type : null,
    thumb: item.boximg_medium ?? null,
    is_available: item.state !== "unavailable",
  };
}

export async function fetchGamersgateFeed(region: GamersgateRegion): Promise<GamersgateFeedRow[]> {
  const url = `https://feeds.gamersgate.com/feeds/products?aff=${AFF_ID}&country=${region}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/xml" },
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    throw new Error(`GamersGate product feed (${region}) returned ${res.status}`);
  }

  const xml = await res.text();
  const parsed = parser.parse(xml) as RawFeedResponse;
  const currency = parsed.xml?.currency ?? "USD";
  const rawItems = parsed.xml?.item;
  const items: RawItem[] = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  const rows: GamersgateFeedRow[] = [];
  for (const item of items) {
    const row = toFeedRow(item, region, currency);
    if (row) rows.push(row);
  }
  return rows;
}
