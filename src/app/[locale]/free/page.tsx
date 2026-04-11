"use client";

import { useEffect, useState } from "react";
import DealCard from "@/components/DealCard";
import { Gift, RefreshCw, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Deal, Store } from "@/types";

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
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/deals?upperPrice=0&pageSize=100&sortBy=recent").then(r => r.json()).catch(() => []),
      fetch("/api/stores").then(r => r.json()).catch(() => []),
    ]).then(([dealsRaw, storesRaw]: [Deal[], Store[]]) => {
      const freeGames = deduplicateDeals(Array.isArray(dealsRaw) ? dealsRaw : []);
      const stores = Array.isArray(storesRaw) ? storesRaw : [];
      const storeMap = Object.fromEntries(stores.map((s) => [s.storeID, s.storeName]));

      const grouped: Record<string, Deal[]> = {};
      for (const game of freeGames) {
        const name = storeMap[game.storeID] ?? `Store ${game.storeID}`;
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(game);
      }
      setByStore(grouped);
      setTotalCount(freeGames.length);
      setLoading(false);
    });
  }, []);

  const storeNames = Object.keys(byStore);

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
      ) : storeNames.length === 0 ? (
        <div className="card p-16 text-center">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t("noGames")}</h2>
          <p className="text-slate-400">{t("noGamesDesc")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">{totalCount}</span>{" "}
              {t("gamesFound", { count: totalCount }).replace(String(totalCount), "").trim()}
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <RefreshCw className="w-3 h-3" />
              {t("updatedEvery")}
            </div>
          </div>

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
        </>
      )}
    </div>
  );
}
