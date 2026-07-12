import { createClient } from "@supabase/supabase-js";
import type { Deal } from "@/types";
import { normalizeGameTitle } from "@/lib/game-title";
import type { OwnSourceGameDeal, OwnSourceGameBase } from "@/lib/gamesplanet-deals";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface IndiegalaDealRow {
  sku: string;
  title: string;
  price: number;
  price_base: number;
  link: string;
  thumb: string | null;
  savings_percent: number;
}

const SELECT_COLUMNS = "sku, title, price, price_base, link, thumb, savings_percent";
const MATCH_COLUMNS = "sku, title, thumb, price, price_base, savings_percent, link";

function toDeal(row: IndiegalaDealRow): Deal {
  return {
    internalName: row.title.toUpperCase().replace(/[^A-Z0-9]+/g, ""),
    title: row.title,
    metacriticLink: null,
    dealID: `ig-${row.sku}`,
    storeID: "30",
    gameID: `ig-${row.sku}`,
    salePrice: row.price.toFixed(2),
    normalPrice: row.price_base.toFixed(2),
    isOnSale: row.price < row.price_base ? "1" : "0",
    savings: row.savings_percent.toFixed(2),
    metacriticScore: "0",
    steamRatingText: null,
    steamRatingPercent: "0",
    steamRatingCount: "0",
    steamAppID: null,
    releaseDate: 0,
    lastChange: Math.floor(Date.now() / 1000),
    dealRating: Math.min(10, row.savings_percent / 10).toFixed(1),
    thumb: row.thumb ?? "",
    directUrl: row.link,
  };
}

function toOwnSourceDeal(row: IndiegalaDealRow): OwnSourceGameDeal {
  return {
    storeID: "30",
    dealID: `ig-${row.sku}`,
    price: row.price.toFixed(2),
    retailPrice: row.price_base.toFixed(2),
    savings: row.savings_percent.toFixed(2),
    directUrl: row.link,
    steamAppID: null,
  };
}

export interface GetIndiegalaDealsParams {
  title?: string;
  onSale?: boolean;
  upperPrice?: number;
  lowerPrice?: number;
  sortBy?: string;
  limit?: number;
  offset?: number;
}

export async function getIndiegalaDeals(params: GetIndiegalaDealsParams = {}): Promise<Deal[]> {
  const limit = params.limit ?? 24;
  const offset = params.offset ?? 0;

  let query = supabase
    .from("indiegala_deals")
    .select(SELECT_COLUMNS)
    .eq("is_available", true)
    .eq("is_dlc", false);

  if (params.title) query = query.ilike("title", `%${params.title}%`);
  if (params.onSale) query = query.eq("is_on_sale", true);
  if (params.upperPrice !== undefined) query = query.lte("price", params.upperPrice);
  if (params.lowerPrice !== undefined) query = query.gte("price", params.lowerPrice);

  switch (params.sortBy) {
    case "Price":
      query = query.order("price", { ascending: true });
      break;
    case "Title":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("savings_percent", { ascending: false });
  }

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;

  return (data ?? []).map(toDeal);
}

/** Cross-references our own IndieGala catalog by normalized title — this
 *  source has no Steam App ID data, so title matching is the only option. */
export async function getIndiegalaDealByTitle(title: string): Promise<OwnSourceGameDeal | null> {
  const { data, error } = await supabase
    .from("indiegala_deals")
    .select(MATCH_COLUMNS)
    .eq("is_available", true)
    .eq("normalized_title", normalizeGameTitle(title))
    .limit(1)
    .maybeSingle<IndiegalaDealRow>();

  if (error || !data) return null;
  return toOwnSourceDeal(data);
}

/** Loads a single IndieGala product by its own sku — used to seed the game
 *  detail page when the visitor arrives via an `ig-<sku>` gameID. */
export async function getIndiegalaGameBySku(sku: string): Promise<OwnSourceGameBase | null> {
  const { data, error } = await supabase
    .from("indiegala_deals")
    .select(MATCH_COLUMNS)
    .eq("sku", sku)
    .maybeSingle<IndiegalaDealRow>();

  if (error || !data) return null;

  return {
    title: data.title,
    thumb: data.thumb ?? "",
    steamAppID: null,
    deal: toOwnSourceDeal(data),
  };
}
