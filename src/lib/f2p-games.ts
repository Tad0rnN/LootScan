/**
 * Hardcoded popular Free-to-Play games.
 *
 * CheapShark doesn't reliably index F2P titles (no price history,
 * sometimes never listed — Fortnite, Genshin, The Finals, etc.).
 * Instead we keep a curated list with Steam App IDs and link
 * directly to each game's store page. Thumbnails are pulled from
 * Steam's public CDN.
 *
 * For games not on Steam (Fortnite, Genshin Impact, main World of
 * Tanks client) provide a customStoreUrl and customThumb.
 */

export interface F2PGame {
  title: string;
  /** Steam App ID. Used for both the thumbnail and the store link. */
  steamAppID?: string;
  /** Override the store URL (use for non-Steam F2P games). */
  customStoreUrl?: string;
  /** Override the thumbnail URL. */
  customThumb?: string;
}

export const F2P_GAMES: F2PGame[] = [
  { title: "Path of Exile", steamAppID: "238960" },
  { title: "Path of Exile 2", steamAppID: "2694490" },
  { title: "Warframe", steamAppID: "230410" },
  { title: "Destiny 2", steamAppID: "1085660" },
  { title: "Apex Legends", steamAppID: "1172470" },
  { title: "War Thunder", steamAppID: "236390" },
  { title: "SMITE", steamAppID: "386360" },
  { title: "Paladins", steamAppID: "444090" },
  { title: "Brawlhalla", steamAppID: "291550" },
  { title: "MultiVersus", steamAppID: "1818750" },
  { title: "The First Descendant", steamAppID: "2074920" },
  { title: "Lost Ark", steamAppID: "1599340" },
  { title: "Dauntless", steamAppID: "846930" },
  { title: "Neverwinter", steamAppID: "109600" },
  { title: "World of Warships", steamAppID: "552990" },
  { title: "Crossout", steamAppID: "386180" },
  { title: "Phantasy Star Online 2", steamAppID: "1056640" },
  { title: "Dota 2", steamAppID: "570" },
  { title: "Counter-Strike 2", steamAppID: "730" },
  { title: "Team Fortress 2", steamAppID: "440" },
  { title: "Delta Force", steamAppID: "2507950" },
  { title: "The Finals", steamAppID: "2073850" },
  { title: "Albion Online", steamAppID: "761890" },
  { title: "Star Trek Online", steamAppID: "9900" },
  { title: "Enlisted", steamAppID: "708520" },
  // Non-Steam F2P (optional — comment out to hide)
  {
    title: "Fortnite",
    customStoreUrl: "https://store.epicgames.com/p/fortnite",
    customThumb:
      "https://cdn1.epicgames.com/offer/fn/Fortnite_Blade_S37_EGS_Launcher_Blade_1200x1600_1200x1600-4a9c7e17e5b8a88ca40712fa88c3e9d5",
  },
  {
    title: "Genshin Impact",
    customStoreUrl: "https://genshin.hoyoverse.com/",
    customThumb:
      "https://webstatic.hoyoverse.com/upload/op-public/2022/12/07/84da25ae6ba3dda9b6d0a1d9b72e3abf_8183708869229546330.jpg",
  },
];

function steamCapsule(appID: string): string {
  // 616×353 capsule — same aspect ratio as our DealCard thumbs
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appID}/capsule_616x353.jpg`;
}

export function f2pThumb(game: F2PGame): string {
  if (game.customThumb) return game.customThumb;
  if (game.steamAppID) return steamCapsule(game.steamAppID);
  return "";
}

export function f2pStoreUrl(game: F2PGame): string {
  if (game.customStoreUrl) return game.customStoreUrl;
  if (game.steamAppID) {
    return `https://store.steampowered.com/app/${game.steamAppID}/`;
  }
  return "#";
}
