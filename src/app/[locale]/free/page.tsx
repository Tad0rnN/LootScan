import { getDeals, getStores, deduplicateDeals } from "@/lib/cheapshark";
import DealCard from "@/components/DealCard";
import { Gift, RefreshCw } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

export default async function FreePage() {
  const t = await getTranslations("free");

  const [freeGamesRaw, stores] = await Promise.all([
    getDeals({ upperPrice: 0, pageSize: 100, sortBy: "recent" }).catch(() => []),
    getStores().catch(() => []),
  ]);
  const freeGames = deduplicateDeals(freeGamesRaw);

  const storeMap = Object.fromEntries(stores.map((s) => [s.storeID, s.storeName]));

  const byStore: Record<string, typeof freeGames> = {};
  for (const game of freeGames) {
    const name = storeMap[game.storeID] ?? `Store ${game.storeID}`;
    if (!byStore[name]) byStore[name] = [];
    byStore[name].push(game);
  }

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

      {freeGames.length === 0 ? (
        <div className="card p-16 text-center">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t("noGames")}</h2>
          <p className="text-slate-400">{t("noGamesDesc")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">{freeGames.length}</span> {t("gamesFound", { count: freeGames.length }).replace(String(freeGames.length), "").trim()}
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <RefreshCw className="w-3 h-3" />
              {t("updatedEvery")}
            </div>
          </div>

          {Object.entries(byStore).map(([storeName, games]) => (
            <section key={storeName} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">{storeName}</h2>
                <span className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                  {t("gamesCount", { count: games.length })}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {games.map((game) => (
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
