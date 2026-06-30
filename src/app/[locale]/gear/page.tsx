"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Gamepad2, Headphones, Mouse, Keyboard, Square, Grid3x3, ToggleLeft, Package,
  Monitor, Armchair, Mic, Video, Box, Volume2, Search,
} from "lucide-react";
import { trackAffiliateClick } from "@/lib/analytics";
import wraithProducts from "@/data/wraith-products.json";

interface WraithProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  category: string;
  priceTRY: number;
  compareAtPriceTRY: number | null;
  priceEUR: number;
  compareAtPriceEUR: number | null;
  image: string;
  available: boolean;
}

const PRODUCTS = wraithProducts as WraithProduct[];
const PAGE_SIZE = 48;

const CATEGORIES = [
  { id: "all", icon: Gamepad2 },
  { id: "keyboards", icon: Keyboard },
  { id: "mice", icon: Mouse },
  { id: "headsets", icon: Headphones },
  { id: "mousepads", icon: Square },
  { id: "keycaps", icon: Grid3x3 },
  { id: "switches", icon: ToggleLeft },
  { id: "controllers", icon: Gamepad2 },
  { id: "audio", icon: Volume2 },
  { id: "microphones", icon: Mic },
  { id: "webcams", icon: Video },
  { id: "monitors", icon: Monitor },
  { id: "cases", icon: Box },
  { id: "chairs", icon: Armchair },
  { id: "accessories", icon: Package },
];

function getProductUrl(handle: string): string {
  return `https://wraithesports.com/products/${handle}?utm_source=lootscan&utm_medium=affiliate`;
}

function formatPrice(amount: number, currency: "TRY" | "EUR", locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export default function GearPage() {
  const t = useTranslations("gear");
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const currency: "TRY" | "EUR" = locale === "tr" ? "TRY" : "EUR";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (q && !item.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeCategory, query]);

  const visible = filtered.slice(0, visibleCount);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">{t("subtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="input w-full pl-10"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleCategoryChange(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === id
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                : "bg-white/5 text-slate-400 border border-white/5 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className="w-4 h-4" />
            {t(`categories.${id}`)}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {t("showingCount", { shown: visible.length, total: filtered.length })}
      </p>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((item) => {
          const price = currency === "TRY" ? item.priceTRY : item.priceEUR;
          const compareAt = currency === "TRY" ? item.compareAtPriceTRY : item.compareAtPriceEUR;
          const affiliateUrl = getProductUrl(item.handle);
          return (
            <a
              key={item.handle}
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`card group overflow-hidden hover:border-brand-500/30 transition-all duration-200 ${
                !item.available ? "opacity-60" : ""
              }`}
              onClick={() =>
                trackAffiliateClick({
                  title: item.title,
                  destination_url: affiliateUrl,
                  placement: "gear_page",
                  category: item.category,
                  price: String(price),
                })
              }
            >
              <div className="relative aspect-square bg-white/5 p-4 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={250}
                  height={250}
                  className="object-contain max-h-[200px] group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                {!item.available && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-700/90 text-white text-xs font-semibold rounded-lg shadow-lg">
                    {t("soldOut")}
                  </span>
                )}
                {item.available && compareAt && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-brand-500/90 text-white text-xs font-semibold rounded-lg shadow-lg">
                    -{Math.round(((compareAt - price) / compareAt) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{item.vendor}</p>
                <div className="flex items-end justify-between mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-brand-400">
                      {formatPrice(price, currency, locale)}
                    </span>
                    {compareAt && (
                      <span className="text-slate-600 text-xs line-through">
                        {formatPrice(compareAt, currency, locale)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-brand-400 transition-colors flex items-center gap-1">
                    Wraith →
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="btn-secondary px-6 py-2.5 text-sm font-semibold"
          >
            {t("loadMore")}
          </button>
        </div>
      )}

      {/* Affiliate Disclosure */}
      <p className="text-xs text-slate-600 mt-8 text-center">
        {t("disclosure")}
      </p>
    </div>
  );
}
