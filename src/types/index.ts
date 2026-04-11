export interface Deal {
  internalName: string;
  title: string;
  metacriticLink: string | null;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

export interface Store {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

export interface GameInfo {
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };
  cheapestPriceEver: {
    price: string;
    date: number;
  };
  deals: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }>;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  game_id: string;
  game_title: string;
  game_thumb: string;
  normal_price: string;
  current_price: string;
  created_at: string;
}

export interface SearchResult {
  gameID: string;
  steamAppID: string;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
}

export interface AISearchResponse {
  interpretation: string;
  searchMode: "similar" | "deals";
  gameTitles: string[];
  query?: string;
  filters: {
    title?: string;
    maxPrice?: number | null;
    minMetacritic?: number | null;
    storeID?: string | null;
    sortBy?: string;
    onSale?: boolean;
    steamworks?: boolean;
  };
}
