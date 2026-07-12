import { createClient } from "@supabase/supabase-js";
import type { Deal } from "@/types";
import type { GamersgateRegion } from "@/lib/sources/gamersgate-feed";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GamersgateDealRow {
  sku: string;
  title: string;
  price: number;
  price_base: number;
  link: string;
  thumb: string | null;
  savings_percent: number;
}

const SELECT_COLUMNS = "sku, title, price, price_base, link, thumb, savings_percent";

export interface GetGamersgateDealsParams {
  region?: GamersgateRegion;
  title?: string;
  onSale?: boolean;
  upperPrice?: number;
  lowerPrice?: number;
  sortBy?: string;
  limit?: number;
  offset?: number;
}

function toDeal(row: GamersgateDealRow): Deal {
  return {
    internalName: row.title.toUpperCase().replace(/[^A-Z0-9]+/g, ""),
    title: row.title,
    metacriticLink: null,
    dealID: `gg-${row.sku}`,
    storeID: "2",
    gameID: `gg-${row.sku}`,
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

export async function getGamersgateDeals(params: GetGamersgateDealsParams = {}): Promise<Deal[]> {
  const region = params.region ?? "USA";
  const limit = params.limit ?? 24;
  const offset = params.offset ?? 0;

  let query = supabase
    .from("gamersgate_deals")
    .select(SELECT_COLUMNS)
    .eq("region", region)
    .eq("is_available", true);

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
