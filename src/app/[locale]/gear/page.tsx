"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Gamepad2, Headphones, Mouse, Keyboard, Square, Grid3x3, ToggleLeft, Package } from "lucide-react";
import { trackAffiliateClick } from "@/lib/analytics";
import { WRAITH_GEAR_ITEMS, getWraithProductUrl, formatTRY } from "@/data/wraith-gear";

interface GearItem {
  name: string;
  image: string;
  price: string;
  affiliateUrl: string;
  category: string;
  badge?: string;
}

const ALL_GEAR_ITEMS: GearItem[] = WRAITH_GEAR_ITEMS.map((item) => ({
  name: item.name,
  image: item.image,
  price: formatTRY(item.price),
  affiliateUrl: getWraithProductUrl(item.handle),
  category: item.category,
  badge: item.badge,
}));

const CATEGORIES = [
  { id: "all", icon: Gamepad2 },
  { id: "headsets", icon: Headphones },
  { id: "mice", icon: Mouse },
  { id: "keyboards", icon: Keyboard },
  { id: "mousepads", icon: Square },
  { id: "keycaps", icon: Grid3x3 },
  { id: "switches", icon: ToggleLeft },
  { id: "accessories", icon: Package },
];

export default function GearPage() {
  const t = useTranslations("gear");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? ALL_GEAR_ITEMS
    : ALL_GEAR_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">{t("subtitle")}</p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <a
            key={item.name}
            href={item.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="card group overflow-hidden hover:border-brand-500/30 transition-all duration-200"
            onClick={() =>
              trackAffiliateClick({
                title: item.name,
                destination_url: item.affiliateUrl,
                placement: "gear_page",
                category: item.category,
                price: item.price,
              })
            }
          >
            <div className="relative aspect-square bg-white/5 p-4 flex items-center justify-center">
              <Image
                src={item.image}
                alt={item.name}
                width={250}
                height={250}
                className="object-contain max-h-[200px] group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              {item.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-brand-500/90 text-white text-xs font-semibold rounded-lg shadow-lg">
                  {item.badge}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors line-clamp-2">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 capitalize">{t(`categories.${item.category}`)}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-brand-400">{item.price}</span>
                <span className="text-xs text-slate-500 group-hover:text-brand-400 transition-colors flex items-center gap-1">
                  Wraith →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Affiliate Disclosure */}
      <p className="text-xs text-slate-600 mt-8 text-center">
        {t("disclosure")}
      </p>
    </div>
  );
}
