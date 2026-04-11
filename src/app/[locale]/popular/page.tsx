import { findGameBySteamAppIdOrTitle, getGameInfo, getStores } from "@/lib/cheapshark";
import { getTopSteamGames } from "@/lib/steam";
import SteamGameCard from "@/components/SteamGameCard";
import { getTranslations } from "next-intl/server";
import { TrendingUp, Flame, RefreshCw } from "lucide-react";

// Aylik populer liste gun icinde sabit kalsin
export const revalidate = 86400;

function getMonthLabel(locale: string): string {
  const formatMap: Record<string, string> = {
    en: "en-US", tr: "tr-TR", de: "de-DE", nl: "nl-NL", zh: "zh-CN", ja: "ja-JP",
  };
  return new Date().toLocaleString(formatMap[locale] ?? "en-US", { month: "long", year: "numeric" });
}

const VALVE_TITLES = ["counter-strike", "dota", "team fortress", "half-life", "portal", "left 4 dead", "artifact", "underlords", "steamvr"];

function isValveGame(developer: string, publisher: string, name: string): boolean {
  const devpub = `${developer} ${publisher}`.toLowerCase();
  if (devpub.includes("valve")) return true;
  const nameLower = name.toLowerCase();
  return VALVE_TITLES.some((v) => nameLower.includes(v));
}

export default async function PopularPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("popular");
  const monthLabel = getMonthLabel(locale);
  const [steamGames, stores] = await Promise.all([
    getTopSteamGames().catch(() => []),
    getStores().catch(() => []),
  ]);

  const storeMap = Object.fromEntries(stores.map((s) => [s.storeID, s.storeName]));

  const nonValveGames = steamGames
    .filter((game) => !isValveGame(game.developer, game.publisher, game.name))
    .slice(0, 12);

  const monthlyPopularGames = await Promise.all(
    nonValveGames.map(async (game) => {
      try {
        const match = await findGameBySteamAppIdOrTitle({ title: game.name, steamAppID: game.appid });
        if (!match) return { ...game, cheapSharkGameID: undefined, storeDeals: [] };

        const info = await getGameInfo(match.gameID).catch(() => null);
        const storeDeals = (info?.deals ?? [])
          .map((d) => ({
            storeID: d.storeID,
            storeName: storeMap[d.storeID] ?? `Store ${d.storeID}`,
            price: d.price,
            retailPrice: d.retailPrice,
            savings: d.savings,
            dealID: d.dealID,
          }))
          .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
          .slice(0, 4);

        return { ...game, cheapSharkGameID: match.gameID, storeDeals };
      } catch {
        return { ...game, cheapSharkGameID: undefined, storeDeals: [] };
      }
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
          <TrendingUp className="w-3.5 h-3.5" />
          {t("badge")}
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{t("title")}</h1>
        <p className="text-slate-400 max-w-2xl">{t("subtitle")}</p>
      </div>

      {/* Ayin Populer Oyunlari */}
      <section className="mb-16">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                {t("monthlyPicks")}
              </h2>
              <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-lg font-semibold">
                {monthLabel}
              </span>
            </div>
            <p className="text-slate-500 text-sm">{t("monthlyPicksDesc")}</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs flex-shrink-0 pt-1">
            <RefreshCw className="w-3 h-3" />
            {t("updatesMonthly")}
          </div>
        </div>

        {monthlyPopularGames.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2 lg:row-span-2">
              <SteamGameCard game={monthlyPopularGames[0]} rank={1} featured gameID={monthlyPopularGames[0].cheapSharkGameID} storeDeals={monthlyPopularGames[0].storeDeals} />
            </div>
            {monthlyPopularGames.slice(1).map((game, i) => (
              <SteamGameCard key={game.appid} game={game} rank={i + 2} gameID={game.cheapSharkGameID} storeDeals={game.storeDeals} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-400">
            <p className="text-lg text-white mb-2">{t("title")}</p>
            <p className="text-sm">{t("monthlyPicksDesc")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
