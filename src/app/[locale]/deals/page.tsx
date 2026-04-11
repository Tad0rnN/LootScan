"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DealCard from "@/components/DealCard";
import DealsFilters from "@/components/DealsFilters";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { Deal, Store } from "@/types";
import Link from "next/link";

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

  const CHEAPSHARK = "https://www.cheapshark.com/api/1.0";

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(currentParams).forEach(([k, v]) => { if (v) params.set(k, v); });
      // pageSize default
      if (!params.has("pageSize")) params.set("pageSize", "24");
      const res = await fetch(`${CHEAPSHARK}/deals?${params}`);
      if (!res.ok) throw new Error("fetch_failed");
      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Stores tek seferlik yükle
  useEffect(() => {
    fetch(`${CHEAPSHARK}/stores`)
      .then((r) => r.json())
      .then((data: Store[]) => setStores(data.filter((s) => s.isActive === 1)))
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
                    href={`/${locale}/deals?${new URLSearchParams({ ...currentParams, page: String(page - 1) })}`}
                    className="btn-secondary"
                  >
                    {t("previous")}
                  </Link>
                )}
                <span className="text-slate-400 text-sm">{t("page", { page: page + 1 })}</span>
                {deals.length === 24 && (
                  <Link
                    href={`/${locale}/deals?${new URLSearchParams({ ...currentParams, page: String(page + 1) })}`}
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
