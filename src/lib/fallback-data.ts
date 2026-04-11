import type { Deal, GameInfo, SearchResult, Store } from "@/types";

export const fallbackStores: Store[] = [
  { storeID: "1", storeName: "Steam", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "2", storeName: "GamersGate", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "3", storeName: "Green Man Gaming", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "7", storeName: "GOG", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "11", storeName: "Humble Store", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "21", storeName: "WinGameStore", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "23", storeName: "Gamesplanet", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "25", storeName: "Fanatical", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "27", storeName: "Epic Games Store", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  { storeID: "35", storeName: "Nuuvem", isActive: 1, images: { banner: "", logo: "", icon: "" } },
];

export const fallbackDeals: Deal[] = [
  {
    internalName: "SUICIDESQUADKILLTHEJUSTICELEAGUE",
    title: "Suicide Squad: Kill the Justice League",
    metacriticLink: "/game/suicide-squad-kill-the-justice-league/",
    dealID: "ER%2FfOp0PmIbG%2BkoMMkNkd8JljZgzqnQqdZLU%2Bz1MekQ%3D",
    storeID: "3",
    gameID: "273928",
    salePrice: "3.15",
    normalPrice: "69.99",
    isOnSale: "1",
    savings: "95.499357",
    metacriticScore: "63",
    steamRatingText: "Mixed",
    steamRatingPercent: "62",
    steamRatingCount: "7537",
    steamAppID: "315210",
    releaseDate: 1706832000,
    lastChange: 1775835831,
    dealRating: "10.0",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/315210/capsule_231x87.jpg?t=1739898445",
  },
  {
    internalName: "GRAVEYARDKEEPER",
    title: "Graveyard Keeper",
    metacriticLink: "/game/graveyard-keeper/",
    dealID: "26ApbIYC3%2F9C35lFUzstHP7qNuQRRZMPaEYGwrrdXRU%3D",
    storeID: "1",
    gameID: "190996",
    salePrice: "0.00",
    normalPrice: "19.99",
    isOnSale: "1",
    savings: "100.000000",
    metacriticScore: "69",
    steamRatingText: "Very Positive",
    steamRatingPercent: "84",
    steamRatingCount: "16849",
    steamAppID: "599140",
    releaseDate: 1534291200,
    lastChange: 1775754338,
    dealRating: "10.0",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/599140/capsule_231x87.jpg?t=1775516777",
  },
  {
    internalName: "PROPSUMO",
    title: "Prop Sumo",
    metacriticLink: "/game/prop-sumo/",
    dealID: "755Mfm7g4K%2FV0j2pUL7yPu%2BL4LxrzIdUX9lAlzKicH4%3D",
    storeID: "25",
    gameID: "319195",
    salePrice: "0.00",
    normalPrice: "9.99",
    isOnSale: "1",
    savings: "100.000000",
    metacriticScore: "0",
    steamRatingText: null,
    steamRatingPercent: "0",
    steamRatingCount: "0",
    steamAppID: null,
    releaseDate: 1775692800,
    lastChange: 1775750564,
    dealRating: "10.0",
    thumb: "https://cdn1.epicgames.com/spt-assets/a965174568cb492ca3ebbe7a95886261/propsumo-jc5go.png",
  },
  {
    internalName: "METRO2033REDUX",
    title: "Metro 2033 Redux",
    metacriticLink: "/game/metro-2033-redux/",
    dealID: "4N8lwdp8b3fG3Qg1qY2nABPCJ8rgTczjiXluOg3TPBk%3D",
    storeID: "11",
    gameID: "109746",
    salePrice: "1.99",
    normalPrice: "19.99",
    isOnSale: "1",
    savings: "90.045023",
    metacriticScore: "90",
    steamRatingText: "Very Positive",
    steamRatingPercent: "88",
    steamRatingCount: "26651",
    steamAppID: "286690",
    releaseDate: 1408924800,
    lastChange: 1775793843,
    dealRating: "10.0",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/286690/capsule_231x87.jpg?t=1741110084",
  },
  {
    internalName: "HITMAN2SILENTASSASSIN",
    title: "Hitman 2: Silent Assassin",
    metacriticLink: "/game/hitman-2-silent-assassin/",
    dealID: "9LFlfPPXEpdvcFz68YG4VUutBRsMNuc2at1lcODyQYk%3D",
    storeID: "1",
    gameID: "334",
    salePrice: "0.89",
    normalPrice: "8.99",
    isOnSale: "1",
    savings: "90.100111",
    metacriticScore: "87",
    steamRatingText: "Mostly Positive",
    steamRatingPercent: "78",
    steamRatingCount: "1750",
    steamAppID: "6850",
    releaseDate: 1033430400,
    lastChange: 1775934897,
    dealRating: "10.0",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/6850/capsule_231x87.jpg?t=1732293077",
  },
  {
    internalName: "TOMAKSAVETHEEARTHREGENERATION",
    title: "TOMAK : Save the Earth Regeneration",
    metacriticLink: "/game/tomak-save-the-earth-regeneration/",
    dealID: "TcbBFOlAwz0iGIS0hFR82mQ%2FrFTrJTlT%2B6cQLeBIles%3D",
    storeID: "25",
    gameID: "318795",
    salePrice: "0.00",
    normalPrice: "8.99",
    isOnSale: "1",
    savings: "100.000000",
    metacriticScore: "0",
    steamRatingText: null,
    steamRatingPercent: "0",
    steamRatingCount: "0",
    steamAppID: null,
    releaseDate: 1775088000,
    lastChange: 1775088712,
    dealRating: "10.0",
    thumb: "https://cdn1.epicgames.com/spt-assets/603c0097f96047c38bc199331b5cf95b/tomak--save-the-earth-regeneration-l1n5k.png",
  },
  {
    internalName: "ACESANDADVENTURES",
    title: "Aces and Adventures",
    metacriticLink: "/game/aces-and-adventures/",
    dealID: "yXWoPbOU0lIAUrHfByAcNgDjUGy3oCM%2FKu0M%2BtHgbTM%3D",
    storeID: "23",
    gameID: "256932",
    salePrice: "1.45",
    normalPrice: "19.99",
    isOnSale: "1",
    savings: "92.746373",
    metacriticScore: "84",
    steamRatingText: "Very Positive",
    steamRatingPercent: "89",
    steamRatingCount: "595",
    steamAppID: "1815570",
    releaseDate: 1677110400,
    lastChange: 1775919901,
    dealRating: "10.0",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1815570/capsule_231x87.jpg?t=1731955791",
  },
  {
    internalName: "WINDBOUND",
    title: "Windbound",
    metacriticLink: "/game/windbound/",
    dealID: "LjM41A4Kszj5kNCdqqF2Cyt62gP5XnShX662VXg%2FkdQ%3D",
    storeID: "1",
    gameID: "216865",
    salePrice: "1.99",
    normalPrice: "19.99",
    isOnSale: "1",
    savings: "90.045023",
    metacriticScore: "0",
    steamRatingText: "Mixed",
    steamRatingPercent: "60",
    steamRatingCount: "1009",
    steamAppID: "1162130",
    releaseDate: 1777593600,
    lastChange: 1775765140,
    dealRating: "10.0",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1162130/capsule_231x87.jpg?t=1709649147",
  },
  {
    internalName: "DEUSEXHUMANREVOLUTIONDIRECTORSCUT",
    title: "Deus Ex: Human Revolution - Director's Cut",
    metacriticLink: "/game/deus-ex-human-revolution-directors-cut/",
    dealID: "ptKLhxHA7hp%2B%2FPeeKN0oOLi7JpCa1gQt4PjYH11bjAI%3D",
    storeID: "27",
    gameID: "102249",
    salePrice: "2.88",
    normalPrice: "19.99",
    isOnSale: "1",
    savings: "85.592796",
    metacriticScore: "91",
    steamRatingText: "Very Positive",
    steamRatingPercent: "91",
    steamRatingCount: "13221",
    steamAppID: "238010",
    releaseDate: 1382400000,
    lastChange: 1775813787,
    dealRating: "10.0",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/238010/capsule_231x87.jpg?t=1726596595",
  },
  {
    internalName: "SHADOWTACTICSBLADESOFTHESHOGUN",
    title: "Shadow Tactics: Blades of the Shogun",
    metacriticLink: "/game/shadow-tactics-blades-of-the-shogun/",
    dealID: "a21kblXJUbPTLdG3BaS%2B9JuGy68jy1FMgfGp6B9DHgM%3D",
    storeID: "27",
    gameID: "158443",
    salePrice: "3.12",
    normalPrice: "39.99",
    isOnSale: "1",
    savings: "92.198050",
    metacriticScore: "85",
    steamRatingText: "Very Positive",
    steamRatingPercent: "94",
    steamRatingCount: "8989",
    steamAppID: "418240",
    releaseDate: 1480982400,
    lastChange: 1775813836,
    dealRating: "9.9",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/418240/capsule_231x87.jpg?t=1770912397",
  },
  {
    internalName: "EUROPAUNIVERSALISIV",
    title: "Europa Universalis IV",
    metacriticLink: "/game/europa-universalis-iv/",
    dealID: "3n5AuHGzuk2%2FTSnMf%2F7lWv9zdH5g%2BuDGUMhlpr68w08%3D",
    storeID: "27",
    gameID: "98151",
    salePrice: "4.90",
    normalPrice: "49.99",
    isOnSale: "1",
    savings: "90.198040",
    metacriticScore: "87",
    steamRatingText: "Very Positive",
    steamRatingPercent: "87",
    steamRatingCount: "47360",
    steamAppID: "236850",
    releaseDate: 1376352000,
    lastChange: 1775813785,
    dealRating: "9.8",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/236850/f4e714d0f5a6be6b76e4b7cfddd692ccc689884a/capsule_231x87.jpg?t=1746720143",
  },
  {
    internalName: "TRACTORRACERS",
    title: "Tractor Racers",
    metacriticLink: "/game/tractor-racers/",
    dealID: "YI7L9NhbmhO5EEEP%2FpJ%2FAd%2FSyTWyzStP8pVujBXAMGU%3D",
    storeID: "25",
    gameID: "315219",
    salePrice: "0.00",
    normalPrice: "9.99",
    isOnSale: "1",
    savings: "100.000000",
    metacriticScore: "0",
    steamRatingText: null,
    steamRatingPercent: "0",
    steamRatingCount: "0",
    steamAppID: null,
    releaseDate: 1769126400,
    lastChange: 1775153200,
    dealRating: "9.7",
    thumb: "https://cdn1.epicgames.com/spt-assets/b98a9b2b7c364e7385f103538d86754c/tractor-racers-1j5u0.jpg",
  },
  {
    internalName: "WAVETALE",
    title: "Wavetale",
    metacriticLink: "/game/wavetale/",
    dealID: "mWsL881r3tpiynzRJvT4cC9BtZkCDjskr%2FeIWzpdjGc%3D",
    storeID: "27",
    gameID: "254596",
    salePrice: "1.29",
    normalPrice: "29.99",
    isOnSale: "1",
    savings: "95.698566",
    metacriticScore: "78",
    steamRatingText: "Very Positive",
    steamRatingPercent: "88",
    steamRatingCount: "1232",
    steamAppID: "1823930",
    releaseDate: 1670803200,
    lastChange: 1775814527,
    dealRating: "9.7",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1823930/capsule_231x87.jpg?t=1759330606",
  },
  {
    internalName: "ROGUELEGACY",
    title: "Rogue Legacy",
    metacriticLink: "/game/rogue-legacy/",
    dealID: "wNjuHxmHnC40ibZzD%2BZ8DGxniOylfO3jy9rXt3Y8Rt8%3D",
    storeID: "7",
    gameID: "99739",
    salePrice: "1.49",
    normalPrice: "14.99",
    isOnSale: "1",
    savings: "90.060040",
    metacriticScore: "85",
    steamRatingText: "Very Positive",
    steamRatingPercent: "91",
    steamRatingCount: "10027",
    steamAppID: "241600",
    releaseDate: 1372291200,
    lastChange: 1775752511,
    dealRating: "9.6",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/241600/capsule_231x87.jpg?t=1743078622",
  },
  {
    internalName: "HOMEWORLDREMASTEREDCOLLECTION",
    title: "Homeworld Remastered Collection",
    metacriticLink: "/game/homeworld-remastered-collection/",
    dealID: "skE16m6d%2FlvPGahH%2Fpmu1nogLtWGk9yZufNNEzESn50%3D",
    storeID: "7",
    gameID: "141243",
    salePrice: "3.49",
    normalPrice: "34.99",
    isOnSale: "1",
    savings: "90.025722",
    metacriticScore: "86",
    steamRatingText: "Very Positive",
    steamRatingPercent: "87",
    steamRatingCount: "7697",
    steamAppID: "244160",
    releaseDate: 1424822400,
    lastChange: 1775747553,
    dealRating: "9.6",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/244160/capsule_231x87.jpg?t=1754416997",
  },
  {
    internalName: "TOWEROFTIME",
    title: "Tower of Time",
    metacriticLink: "/game/tower-of-time/",
    dealID: "gguSIDvjtEBR2As2%2FU3Glxf0%2Fjy54H%2F1eY6OEMUsSy8%3D",
    storeID: "1",
    gameID: "170871",
    salePrice: "1.74",
    normalPrice: "24.99",
    isOnSale: "1",
    savings: "93.037215",
    metacriticScore: "77",
    steamRatingText: "Very Positive",
    steamRatingPercent: "83",
    steamRatingCount: "1354",
    steamAppID: "617480",
    releaseDate: 1523491200,
    lastChange: 1775935073,
    dealRating: "9.6",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/617480/75e6dee24eecc1fb9f7d4f0b0f2b7a3a6ff207a0/capsule_231x87.jpg?t=1775920443",
  },
  {
    internalName: "FREEDOMFIGHTERS",
    title: "Freedom Fighters",
    metacriticLink: "/game/freedom-fighters/",
    dealID: "BJODKdo23Gp%2BdAVErkHh9KLxu%2BaEIA3Hk%2FJC9RDburU%3D",
    storeID: "1",
    gameID: "220702",
    salePrice: "1.49",
    normalPrice: "14.99",
    isOnSale: "1",
    savings: "90.060040",
    metacriticScore: "80",
    steamRatingText: "Very Positive",
    steamRatingPercent: "94",
    steamRatingCount: "1557",
    steamAppID: "1347780",
    releaseDate: 1064966400,
    lastChange: 1775934859,
    dealRating: "9.6",
    thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1347780/capsule_231x87.jpg?t=1600704099",
  },
];

function priceValue(value: string): number {
  return parseFloat(value || "0");
}

function scoreValue(value: string): number {
  return parseInt(value || "0", 10);
}

function sortDeals(deals: Deal[], sortBy?: string): Deal[] {
  const list = [...deals];
  switch (sortBy) {
    case "Price":
      return list.sort((a, b) => priceValue(a.salePrice) - priceValue(b.salePrice));
    case "Savings":
      return list.sort((a, b) => priceValue(b.savings) - priceValue(a.savings));
    case "Metacritic":
      return list.sort((a, b) => scoreValue(b.metacriticScore) - scoreValue(a.metacriticScore));
    case "Title":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return list.sort((a, b) => priceValue(b.dealRating) - priceValue(a.dealRating));
  }
}

export function getFallbackDeals(params: {
  title?: string | null;
  storeID?: string | null;
  upperPrice?: string | null;
  lowerPrice?: string | null;
  metacritic?: string | null;
  onSale?: string | null;
  sortBy?: string | null;
  pageSize?: string | null;
  pageNumber?: string | null;
}): Deal[] {
  const title = (params.title ?? "").toLowerCase().trim();
  const storeID = params.storeID ?? null;
  const upperPrice = params.upperPrice ? parseFloat(params.upperPrice) : undefined;
  const lowerPrice = params.lowerPrice ? parseFloat(params.lowerPrice) : undefined;
  const metacritic = params.metacritic ? parseInt(params.metacritic, 10) : undefined;
  const onSaleOnly = params.onSale === "1";
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 24;
  const pageNumber = params.pageNumber ? parseInt(params.pageNumber, 10) : 0;

  let deals = fallbackDeals.filter((deal) => {
    if (title && !deal.title.toLowerCase().includes(title)) return false;
    if (storeID && deal.storeID !== storeID) return false;
    if (upperPrice !== undefined && priceValue(deal.salePrice) > upperPrice) return false;
    if (lowerPrice !== undefined && priceValue(deal.salePrice) < lowerPrice) return false;
    if (metacritic !== undefined && scoreValue(deal.metacriticScore) < metacritic) return false;
    if (onSaleOnly && deal.isOnSale !== "1") return false;
    return true;
  });

  deals = sortDeals(deals, params.sortBy ?? undefined);
  const start = Math.max(pageNumber, 0) * Math.max(pageSize, 1);
  return deals.slice(start, start + Math.max(pageSize, 1));
}

export const fallbackSearchResults: SearchResult[] = fallbackDeals.map((deal) => ({
  gameID: deal.gameID,
  steamAppID: deal.steamAppID ?? "",
  cheapest: deal.salePrice,
  cheapestDealID: deal.dealID,
  external: deal.title,
  internalName: deal.internalName,
  thumb: deal.thumb,
}));

export function searchFallbackGames(title: string): SearchResult[] {
  const query = title.toLowerCase().trim();
  if (!query) return [];

  return fallbackSearchResults.filter((game) => {
    return game.external.toLowerCase().includes(query)
      || game.internalName.toLowerCase().includes(query.replace(/[^a-z0-9]+/g, ""));
  });
}

export function getFallbackGameInfo(gameID: string): GameInfo | null {
  const deals = fallbackDeals
    .filter((deal) => deal.gameID === gameID)
    .sort((a, b) => priceValue(a.salePrice) - priceValue(b.salePrice));

  if (deals.length === 0) return null;

  const cheapest = deals[0];
  return {
    info: {
      title: cheapest.title,
      steamAppID: cheapest.steamAppID,
      thumb: cheapest.thumb,
    },
    cheapestPriceEver: {
      price: cheapest.salePrice,
      date: cheapest.lastChange,
    },
    deals: deals.map((deal) => ({
      storeID: deal.storeID,
      dealID: deal.dealID,
      price: deal.salePrice,
      retailPrice: deal.normalPrice,
      savings: deal.savings,
    })),
  };
}
