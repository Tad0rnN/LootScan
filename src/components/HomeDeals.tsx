"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DealCard from "@/components/DealCard";
import { useTranslations, useLocale } from "next-intl";
import { Zap, Gift, ArrowRight } from "lucide-react";
import type { Deal } from "@/types";

function deduplicateDeals(deals: Deal[]): Deal[] {
  const map = new Map<string, Deal>();
  for (const deal of deals) {
    const existing = map.get(deal.gameID);
    if (!existing || parseFloat(deal.salePrice) < parseFloat(existing.salePrice)) {
      map.set(deal.gameID, deal);
    }
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

export default function HomeDeals() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [hotDeals, setHotDeals] = useState<Deal[]>([]);
  const [freeGames, setFreeGames] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hotParams = new URLSearchParams({ sortBy: "Deal Rating", pageSize: "40", onSale: "1" });
    const freeParams = new URLSearchParams({ upperPrice: "0", pageSize: "20" });

    Promise.all([
      fetch(`/api/deals?${hotParams}`).then((r) => r.json()).catch(() => []),
      fetch(`/api/deals?${freeParams}`).then((r) => r.json()).catch(() => []),
    ]).then(([hot, free]) => {
      setHotDeals(deduplicateDeals(Array.isArray(hot) ? hot : []).slice(0, 8));
      setFreeGames(deduplicateDeals(Array.isArray(free) ? free : []).slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <>
      {/* Hot Deals */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-400" />
            {t("hotDeals")}
          </h2>
          <Link href={`/${locale}/deals`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-400 transition-colors font-medium">
            {t("viewAll")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : hotDeals.map((deal) => <DealCard key={deal.dealID} deal={deal} />)
          }
        </div>
      </section>

      {/* Free Games */}
      {(loading || freeGames.length > 0) && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              {t("freeNow")}
            </h2>
            <Link href={`/${locale}/free`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-amber-400 transition-colors font-medium">
              {t("viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : freeGames.map((deal) => <DealCard key={deal.dealID} deal={deal} />)
            }
          </div>
        </section>
      )}
    </>
  );
}
