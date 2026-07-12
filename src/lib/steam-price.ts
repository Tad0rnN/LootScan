import type { OwnSourceGameDeal } from "@/lib/gamesplanet-deals";

interface SteamAppDetailsResponse {
  [appid: string]: {
    success?: boolean;
    data?: {
      is_free?: boolean;
      price_overview?: {
        currency: string;
        initial: number;
        final: number;
        discount_percent: number;
      };
    };
  };
}

/** Fetches the real US Steam Store price for a game (official, free
 *  appdetails endpoint — not the EU/TR regional-arbitrage pricing used
 *  elsewhere on the site) so it can appear as its own row in the game
 *  detail price comparison table. */
export async function getSteamStorePrice(appid: string): Promise<OwnSourceGameDeal | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appid)}&cc=us&l=english`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as SteamAppDetailsResponse;
    const app = data[appid];
    if (!app?.success || !app.data) return null;

    const directUrl = `https://store.steampowered.com/app/${appid}/`;

    if (app.data.is_free) {
      return {
        storeID: "1",
        dealID: `steam-${appid}`,
        price: "0.00",
        retailPrice: "0.00",
        savings: "0",
        directUrl,
      };
    }

    const overview = app.data.price_overview;
    if (!overview || overview.currency !== "USD") return null;

    return {
      storeID: "1",
      dealID: `steam-${appid}`,
      price: (overview.final / 100).toFixed(2),
      retailPrice: (overview.initial / 100).toFixed(2),
      savings: String(overview.discount_percent ?? 0),
      directUrl,
    };
  } catch {
    return null;
  }
}
