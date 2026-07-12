import { XMLParser } from "fast-xml-parser";

export type GamesplanetRegion = "fr" | "uk" | "de" | "us";

export const GAMESPLANET_REGIONS: GamesplanetRegion[] = ["fr", "uk", "de", "us"];

const REGION_CURRENCY: Record<GamesplanetRegion, string> = {
  fr: "EUR",
  uk: "GBP",
  de: "EUR",
  us: "USD",
};

export interface GamesplanetFeedRow {
  uid: string;
  region: GamesplanetRegion;
  title: string;
  price: number;
  price_base: number;
  currency: string;
  link: string;
  steam_app_id: string | null;
  delivery_type: string | null;
  category: string | null;
  publisher: string | null;
  thumb: string | null;
}

interface RawProduct {
  uid?: string | number;
  name?: string;
  price?: number | string;
  price_base?: number | string;
  link?: string;
  publisher?: string;
  category?: string;
  delivery_type?: string;
  steam_id?: string;
  packshot?: string;
}

const parser = new XMLParser();

function parseSteamAppId(steamId: string | undefined): string | null {
  if (!steamId) return null;
  const match = steamId.match(/(\d+)$/);
  return match ? match[1] : null;
}

function toFeedRow(product: RawProduct, region: GamesplanetRegion): GamesplanetFeedRow | null {
  if (!product.uid || !product.name || !product.link) return null;

  return {
    uid: String(product.uid),
    region,
    title: String(product.name),
    price: Number(product.price) || 0,
    price_base: Number(product.price_base) || 0,
    currency: REGION_CURRENCY[region],
    link: String(product.link),
    steam_app_id: parseSteamAppId(product.steam_id),
    delivery_type: product.delivery_type ?? null,
    category: product.category ?? null,
    publisher: product.publisher ?? null,
    thumb: product.packshot ?? null,
  };
}

export async function fetchGamesplanetFeed(region: GamesplanetRegion): Promise<GamesplanetFeedRow[]> {
  const url = `https://${region}.gamesplanet.com/api/v1/products/feed.xml?ref=lootscan`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LootScanBot/1.0; +https://lootscan.co)",
      Accept: "application/xml",
    },
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    throw new Error(`Gamesplanet feed (${region}) returned ${res.status}`);
  }

  const xml = await res.text();
  const parsed = parser.parse(xml) as { products?: { product?: RawProduct | RawProduct[] } };
  const rawProducts = parsed.products?.product;
  const products: RawProduct[] = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts
      ? [rawProducts]
      : [];

  const rows: GamesplanetFeedRow[] = [];
  for (const product of products) {
    const row = toFeedRow(product, region);
    if (row) rows.push(row);
  }
  return rows;
}
