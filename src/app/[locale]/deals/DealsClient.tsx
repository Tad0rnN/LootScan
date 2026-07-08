"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DealCard from "@/components/DealCard";
import DealsFilters from "@/components/DealsFilters";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { Deal, Store } from "@/types";
import Link from "next/link";
import { fetchDeals as fetchDealsApi, fetchStores as fetchStoresApi } from "@/lib/fetch-deals";

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

export default function DealsPage() {
  const t = useTranslations("deals");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") ?? "0");

  const currentParams: Record<string, string | undefined> = {
    storeID:    searchParams.get("storeID")    ?? undefined,
    sortBy:     searchParams.get("sortBy")     ?? undefined,
    upperPrice: searchParams.get("upperPrice") ?? undefined,
    lowerPrice: searchParams.get("lowerPrice") ?? undefined,
    metacritic: searchParams.get("metacritic") ?? undefined,
    title:      searchParams.get("title")      ?? undefined,
    onSale:     searchParams.get("onSale")     ?? undefined,
    page:       searchParams.get("page")       ?? undefined,
  };

  // undefined değerleri temizleyerek URL oluştur
  function buildPageUrl(targetPage: number): string {
    const p = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== "page") p.set(k, v);
    });
    if (targetPage > 0) p.set("page", String(targetPage));
    return p.toString();
  }

  function deduplicateDeals(raw: Deal[]): Deal[] {
    const map = new Map<string, Deal>();
    for (const deal of raw) {
      const existing = map.get(deal.gameID);
      if (!existing || parseFloat(deal.salePrice) < parseFloat(existing.salePrice))
        map.set(deal.gameID, deal);
    }
    return Array.from(map.values());
  }

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const hasFilters = !!(
    currentParams.storeID || currentParams.sortBy || currentParams.title ||
    currentParams.metacritic || currentParams.upperPrice || currentParams.lowerPrice ||
    currentParams.onSale
  );

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result: Deal[] = [];

      if (hasFilters || page > 0) {
        // Filtreli / sayfalı: parametreleri doğrudan CheapShark'a ilet
        const params = new URLSearchParams();
        if (currentParams.storeID)    params.set("storeID",    currentParams.storeID);
        if (currentParams.sortBy)     params.set("sortBy",     currentParams.sortBy);
        if (currentParams.upperPrice) params.set("upperPrice", currentParams.upperPrice);
        if (currentParams.lowerPrice) params.set("lowerPrice", currentParams.lowerPrice);
        if (currentParams.metacritic) params.set("metacritic", currentParams.metacritic);
        if (currentParams.title)      params.set("title",      currentParams.title);
        if (currentParams.onSale)     params.set("onSale",     currentParams.onSale);
        params.set("pageNumber", String(page)); // CheapShark pageNumber kullanır
        params.set("pageSize", currentParams.storeID ? "24" : "60");
        const data = await fetchDealsApi(params);
        const raw = Array.isArray(data) ? data : [];
        result = currentParams.storeID ? raw : deduplicateDeals(raw).slice(0, 24);
      } else {
        // Varsayılan: iyi puanlı oyunlardan 2 rastgele sayfa çek, karıştır
        const startPage = Math.floor(Math.random() * 6);
        const p1 = new URLSearchParams({ steamRating: "70", sortBy: "DealRating", pageSize: "60", pageNumber: String(startPage) });
        const p2 = new URLSearchParams({ steamRating: "70", sortBy: "DealRating", pageSize: "60", pageNumber: String(startPage + 1) });
        const [r1, r2] = await Promise.all([
          fetchDealsApi(p1).catch(() => []),
          fetchDealsApi(p2).catch(() => []),
        ]);
        const pool = deduplicateDeals([...(Array.isArray(r1) ? r1 : []), ...(Array.isArray(r2) ? r2 : [])]);
        result = shuffleArray(pool).slice(0, 24);
      }

      setDeals(result);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Stores tek seferlik yükle
  useEffect(() => {
    fetchStoresApi()
      .then((data) => setStores((data as Store[]).filter((s) => s.isActive === 1)))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {t("loading")}
            </span>
          ) : error ? (
            "\u00a0"
          ) : (
            t("found", { count: deals.length })
          )}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 flex-shrink-0">
          <DealsFilters stores={stores} currentParams={currentParams} />
        </aside>

        <div className="flex-1">
          {/* Error state */}
          {error && !loading && (
            <div className="card p-12 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-1">{t("errorTitle")}</p>
              <p className="text-slate-400 text-sm mb-6">{t("errorDesc")}</p>
              <button onClick={fetchDeals} className="btn-primary inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                {t("retry")}
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && deals.length === 0 && (
            <div className="card p-12 text-center text-slate-400">
              <p className="text-lg">{t("noDeals")}</p>
              <p className="text-sm mt-2">{t("tryAdjusting")}</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && deals.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {deals.map((deal) => (
                  <DealCard key={deal.dealID} deal={deal} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-3 mt-8">
                {page > 0 && (
                  <Link
                    href={`/${locale}/deals?${buildPageUrl(page - 1)}`}
                    className="btn-secondary"
                  >
                    {t("previous")}
                  </Link>
                )}
                <span className="text-slate-400 text-sm">{t("page", { page: page + 1 })}</span>
                {deals.length === 24 && (
                  <Link
                    href={`/${locale}/deals?${buildPageUrl(page + 1)}`}
                    className="btn-secondary"
                  >
                    {t("next")}
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
