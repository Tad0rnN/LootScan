"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Store } from "@/types";
import { Filter, RotateCcw, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";

interface Props {
  stores: Store[];
  currentParams: Record<string, string | undefined>;
}

const SORT_OPTIONS = [
  { value: "Deal Rating", key: "bestDeal" },
  { value: "Savings", key: "biggestSavings" },
  { value: "Price", key: "lowestPrice" },
  { value: "Metacritic", key: "metacritic" },
  { value: "Reviews", key: "steamReviews" },
  { value: "recent", key: "recentlyUpdated" },
  { value: "Release", key: "releaseDate" },
  { value: "Title", key: "titleAZ" },
] as const;

export default function DealsFilters({ stores, currentParams }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("filters");
  const [title, setTitle] = useState(currentParams.title ?? "");
  const [storeID, setStoreID] = useState(currentParams.storeID ?? "");
  const [sortBy, setSortBy] = useState(currentParams.sortBy ?? "Deal Rating");
  const [upperPrice, setUpperPrice] = useState(currentParams.upperPrice ?? "");
  const [metacritic, setMetacritic] = useState(currentParams.metacritic ?? "");
  const [onSale, setOnSale] = useState(currentParams.onSale === "1");
  // Filters start collapsed on mobile so deals are visible without scrolling past
  // a full-screen filter panel; the toggle is hidden on lg+ where the sidebar fits.
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Boolean(
    currentParams.title || currentParams.storeID || currentParams.upperPrice ||
    currentParams.metacritic || currentParams.onSale
  );

  const apply = () => {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (storeID) params.set("storeID", storeID);
    if (sortBy) params.set("sortBy", sortBy);
    if (upperPrice !== "") params.set("upperPrice", upperPrice);
    if (metacritic) params.set("metacritic", metacritic);
    if (onSale) params.set("onSale", "1");
    router.push(`/${locale}/deals?${params}`);
  };

  const reset = () => {
    setTitle(""); setStoreID(""); setSortBy("Deal Rating");
    setUpperPrice(""); setMetacritic(""); setOnSale(false);
    router.push(`/${locale}/deals`);
  };

  return (
    <div className="card p-4 lg:space-y-4 sticky top-20">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="font-semibold text-white flex items-center gap-2 lg:pointer-events-none"
        >
          <Filter className="w-4 h-4 text-brand-400" />
          {t("title")}
          {hasActiveFilters && (
            <span className="lg:hidden w-1.5 h-1.5 rounded-full bg-brand-400" />
          )}
          <ChevronDown className={clsx("w-4 h-4 text-slate-500 lg:hidden transition-transform", isExpanded && "rotate-180")} />
        </button>
        <button onClick={reset} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
          <RotateCcw className="w-3 h-3" />
          {t("reset")}
        </button>
      </div>

      <div className={clsx("space-y-4 mt-4 lg:mt-0", !isExpanded && "hidden lg:block")}>
      {/* Title search */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">{t("gameTitle")}</label>
        <input
          type="text"
          className="input w-full text-sm"
          placeholder={t("searchTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
      </div>

      {/* Store */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">{t("store")}</label>
        <select
          className="input w-full text-sm bg-slate-800"
          value={storeID}
          onChange={(e) => setStoreID(e.target.value)}
        >
          <option value="">{t("allStores")}</option>
          {stores.map((s) => (
            <option key={s.storeID} value={s.storeID}>{s.storeName}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">{t("sortBy")}</label>
        <select
          className="input w-full text-sm bg-slate-800"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(o.key)}</option>
          ))}
        </select>
      </div>

      {/* Max price */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">{t("maxPrice")}</label>
        <input
          type="number"
          className="input w-full text-sm"
          placeholder={t("noLimit")}
          min={0}
          step={0.5}
          value={upperPrice}
          onChange={(e) => setUpperPrice(e.target.value)}
        />
      </div>

      {/* Metacritic */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">{t("minMetacritic")}</label>
        <input
          type="number"
          className="input w-full text-sm"
          placeholder="0"
          min={0}
          max={100}
          value={metacritic}
          onChange={(e) => setMetacritic(e.target.value)}
        />
      </div>

      {/* On sale */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 rounded accent-brand-500"
          checked={onSale}
          onChange={(e) => setOnSale(e.target.checked)}
        />
        <span className="text-sm text-slate-300">{t("onSaleOnly")}</span>
      </label>

      <button onClick={apply} className="btn-primary w-full">
        {t("apply")}
      </button>
      </div>
    </div>
  );
}
