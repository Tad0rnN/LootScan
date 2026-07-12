import { createClient } from "@supabase/supabase-js";
import type { Deal } from "@/types";
import type { GamesplanetRegion } from "@/lib/sources/gamesplanet-feed";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GamesplanetDealRow {
  uid: string;
  title: string;
  price: number;
  price_base: number;
  link: string;
  steam_app_id: string | null;
  thumb: string | null;
  savings_percent: number;
}

const SELECT_COLUMNS = "uid, title, price, price_base, link, steam_app_id, thumb, savings_percent";

export interface GetGamesplanetDealsParams {
  region?: GamesplanetRegion;
  title?: string;
  onSale?: boolean;
  upperPrice?: number;
  lowerPrice?: number;
  sortBy?: string;
  limit?: number;
  offset?: number;
}

function toDeal(row: GamesplanetDealRow): Deal {
  return {
    internalName: row.title.toUpperCase().replace(/[^A-Z0-9]+/g, ""),
    title: row.title,
    metacriticLink: null,
    dealID: `gp-${row.uid}`,
    storeID: "27",
    gameID: `gp-${row.uid}`,
    salePrice: row.price.toFixed(2),
    normalPrice: row.price_base.toFixed(2),
    isOnSale: row.price < row.price_base ? "1" : "0",
    savings: row.savings_percent.toFixed(2),
    metacriticScore: "0",
    steamRatingText: null,
    steamRatingPercent: "0",
    steamRatingCount: "0",
    steamAppID: row.steam_app_id,
    releaseDate: 0,
    lastChange: Math.floor(Date.now() / 1000),
    dealRating: Math.min(10, row.savings_percent / 10).toFixed(1),
    thumb: row.thumb ?? "",
    directUrl: row.link,
  };
}

export async function getGamesplanetDeals(params: GetGamesplanetDealsParams = {}): Promise<Deal[]> {
  const region = params.region ?? "us";
  const limit = params.limit ?? 24;
  const offset = params.offset ?? 0;

  let query = supabase
    .from("gamesplanet_deals")
    .select(SELECT_COLUMNS)
    .eq("region", region);

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
