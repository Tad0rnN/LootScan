"use client";

import { useEffect, useState } from "react";
import SteamGameCard from "@/components/SteamGameCard";
import { useTranslations, useLocale } from "next-intl";
import { TrendingUp, Flame, RefreshCw, Loader2 } from "lucide-react";
import type { SteamGameWithImage } from "@/lib/steam";

const VALVE_TITLES = ["counter-strike", "dota", "team fortress", "half-life", "portal", "left 4 dead", "artifact", "underlords", "steamvr"];

function isValveGame(developer: string, publisher: string, name: string): boolean {
  const devpub = `${developer} ${publisher}`.toLowerCase();
  if (devpub.includes("valve")) return true;
  return VALVE_TITLES.some((v) => name.toLowerCase().includes(v));
}

function getMonthLabel(locale: string): string {
  const formatMap: Record<string, string> = {
    en: "en-US", tr: "tr-TR", de: "de-DE", nl: "nl-NL", fr: "fr-FR", it: "it-IT",
  };
  return new Date().toLocaleString(formatMap[locale] ?? "en-US", { month: "long", year: "numeric" });
}

function SkeletonCard({ featured }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="card overflow-hidden animate-pulse h-full min-h-[300px]">
        <div className="bg-slate-800/60 min-h-[220px]" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-slate-800/60 rounded w-3/4" />
          <div className="h-3 bg-slate-800/60 rounded w-1/2" />
        </div>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-slate-800/60 aspect-[16/7]" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-slate-800/60 rounded w-3/4" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2" />
        <div className="h-3 bg-slate-800/60 rounded w-2/3" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function PopularPage() {
  const t = useTranslations("popular");
  const locale = useLocale();
  const monthLabel = getMonthLabel(locale);

  const [games, setGames] = useState<SteamGameWithImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/steamspy")
      .then((r) => r.json())
      .then((data: SteamGameWithImage[]) => {
        const filtered = (data ?? [])
          .filter((g) => !isValveGame(g.developer, g.publisher, g.name))
          .slice(0, 12);
        setGames(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2 lg:row-span-2">
              <SkeletonCard featured />
            </div>
            {Array.from({ length: 11 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2 lg:row-span-2">
              <SteamGameCard game={games[0]} rank={1} featured />
            </div>
            {games.slice(1).map((game, i) => (
              <SteamGameCard key={game.appid} game={game} rank={i + 2} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-slate-600" />
            <p className="text-sm">{t("monthlyPicksDesc")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
