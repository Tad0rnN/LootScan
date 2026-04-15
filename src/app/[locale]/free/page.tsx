"use client";

import { useEffect, useState } from "react";
import DealCard from "@/components/DealCard";
import { Gift, RefreshCw, Loader2, Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Deal, Store } from "@/types";
import { fetchDeals, fetchStores, fetchGameSearch } from "@/lib/fetch-deals";

// Popüler F2P oyun başlıkları — tam eşleşme için kullanılır
const F2P_TITLES = [
  "Path of Exile", "Path of Exile 2", "Warframe", "Destiny 2", "Genshin Impact",
  "Apex Legends", "War Thunder", "Star Trek Online", "SMITE",
  "Paladins", "Brawlhalla", "Enlisted", "MultiVersus",
  "The First Descendant", "Lost Ark", "Dauntless", "Neverwinter",
  "World of Tanks", "World of Warships", "Crossout", "Phantasy Star Online 2",
  "Dota 2", "Counter-Strike 2", "Team Fortress 2", "Fortnite",
  "Delta Force", "The Finals", "Albion Online",
];

// DLC, bundle, pack, starter, skin, gems, edition gibi sonuçları filtrele
const DLC_KEYWORDS = [
  "dlc", "bundle", "pack", "starter", "gems", "coins", "points",
  "skin", "cosmetic", "costume", "season pass", "battle pass",
  "expansion", "upgrade", "deluxe", "premium", "ultimate edition",
  "gold edition", "silver edition", "bronze edition", "supporter",
  "soundtrack", "ost", "art book", "artbook", "wallpaper",
  "emote", "spray", "booster", "token", "ticket", "key",
  "founder", "credit", "currency", "loot box", "crate",
];

function isDlcOrBundle(title: string): boolean {
  const lower = title.toLowerCase();
  return DLC_KEYWORDS.some((kw) => lower.includes(kw));
}

function isBaseGameMatch(searchTitle: string, resultTitle: string): boolean {
  const search = searchTitle.toLowerCase().trim();
  const result = resultTitle.toLowerCase().trim();
  // Tam eşleşme
  if (result === search) return true;
  // "Destiny 2" → "Destiny 2" OK, "Destiny 2: Forsaken" NO
  if (result.startsWith(search)) {
    const rest = result.slice(search.length).trim();
    // Arkasında hiçbir şey yoksa veya sadece trademark sembolü varsa kabul et
    return rest === "" || rest === "™" || rest === "®";
  }
  return false;
}

function deduplicateDeals(deals: Deal[]): Deal[] {
  const map = new Map<string, Deal>();
  for (const deal of deals) {
    const existing = map.get(deal.gameID);
    if (!existing || parseFloat(deal.salePrice) < parseFloat(existing.salePrice))
      map.set(deal.gameID, deal);
  }
  return Array.from(map.values());
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-slate-800/60 aspect-[16/7]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-800/60 rounded w-3/4" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-slate-800/60 rounded w-16" />
          <div className="h-4 bg-slate-800/60 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default function FreePage() {
  const t = useTranslations("free");
  const [byStore, setByStore] = useState<Record<string, Deal[]>>({});
  const [f2pGames, setF2pGames] = useState<Deal[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Birden fazla sayfa çekerek daha fazla bedava oyun bul
        const [page1, page2, page3, storesRaw] = await Promise.all([
          fetchDeals(new URLSearchParams({ upperPrice: "0", pageSize: "60", sortBy: "recent" })).catch(() => []),
          fetchDeals(new URLSearchParams({ upperPrice: "0", pageSize: "60", sortBy: "Deal Rating" })).catch(() => []),
          fetchDeals(new URLSearchParams({ upperPrice: "0", pageSize: "60", sortBy: "Store" })).catch(() => []),
          fetchStores().catch(() => []),
        ]);

        const allFree = [
          ...(Array.isArray(page1) ? page1 : []),
          ...(Array.isArray(page2) ? page2 : []),
          ...(Array.isArray(page3) ? page3 : []),
        ] as Deal[];

        const freeGames = deduplicateDeals(allFree).filter((g) => !isDlcOrBundle(g.title));
        const stores = Array.isArray(storesRaw) ? storesRaw as Store[] : [];
        const storeMap = Object.fromEntries(stores.map((s) => [s.storeID, s.storeName]));

        const grouped: Record<string, Deal[]> = {};
        for (const game of freeGames) {
          const name = storeMap[game.storeID] ?? `Store ${game.storeID}`;
          if (!grouped[name]) grouped[name] = [];
          grouped[name].push(game);
        }
        setByStore(grouped);
        setTotalCount(freeGames.length);

        // F2P oyunları çek (paralel, 5'erli batch)
        const f2pResults: Deal[] = [];
        const seenIds = new Set(freeGames.map(g => g.gameID));

        for (let i = 0; i < F2P_TITLES.length; i += 5) {
          const batch = F2P_TITLES.slice(i, i + 5);
          const results = await Promise.all(
            batch.map(title =>
              fetchGameSearch(title, 5).catch(() => [])
            )
          );

          for (let j = 0; j < results.length; j++) {
            const data: Record<string, string>[] = Array.isArray(results[j]) ? results[j] as Record<string, string>[] : [];
            const searchTitle = batch[j];

            for (const game of data) {
              if (seenIds.has(game.gameID)) continue;
              // DLC/bundle filtrele
              if (isDlcOrBundle(game.external)) continue;
              // Sadece ana oyun eşleşmesi kabul et
              if (!isBaseGameMatch(searchTitle, game.external)) continue;

              seenIds.add(game.gameID);
              f2pResults.push({
                internalName: game.internalName,
                title: game.external,
                metacriticLink: null,
                dealID: game.cheapestDealID ?? `f2p-${game.gameID}`,
                storeID: "1",
                gameID: game.gameID,
                salePrice: "0.00",
                normalPrice: "0.00",
                isOnSale: "1",
                savings: "100",
                metacriticScore: "0",
                steamRatingText: null,
                steamRatingPercent: "0",
                steamRatingCount: "0",
                steamAppID: game.steamAppID ?? null,
                releaseDate: 0,
                lastChange: 0,
                dealRating: "0",
                thumb: game.thumb,
              });
              break;
            }
          }
        }

        setF2pGames(f2pResults);
      } catch {
        // sessizce geç
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const storeNames = Object.keys(byStore);
  const grandTotal = totalCount + f2pGames.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <Gift className="w-4 h-4" />
          {t("badge")}
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">
          {t("title")} <span className="text-yellow-400">{t("titleHighlight")}</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">{t("subtitle")}</p>
      </div>

      {loading ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 bg-slate-800/60 rounded w-32 animate-pulse" />
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <RefreshCw className="w-3 h-3" />
              {t("updatedEvery")}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : storeNames.length === 0 && f2pGames.length === 0 ? (
        <div className="card p-16 text-center">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t("noGames")}</h2>
          <p className="text-slate-400">{t("noGamesDesc")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">{grandTotal}</span>{" "}
              {t("gamesFound", { count: grandTotal }).replace(String(grandTotal), "").trim()}
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <RefreshCw className="w-3 h-3" />
              {t("updatedEvery")}
            </div>
          </div>

          {/* Mağaza bazlı bedava oyunlar */}
          {storeNames.map((storeName) => (
            <section key={storeName} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">{storeName}</h2>
                <span className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                  {t("gamesCount", { count: byStore[storeName].length })}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {byStore[storeName].map((game) => (
                  <DealCard key={game.dealID} deal={game} />
                ))}
              </div>
            </section>
          ))}

          {/* Free to Play oyunlar */}
          {f2pGames.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-green-400" />
                  Free to Play
                </h2>
                <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                  {t("gamesCount", { count: f2pGames.length })}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {f2pGames.map((game) => (
                  <DealCard key={game.dealID} deal={game} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
