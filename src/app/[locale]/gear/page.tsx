"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Gamepad2, Monitor, Headphones, Mouse, Keyboard, Armchair } from "lucide-react";

interface GearItem {
  name: string;
  image: string;
  price: string;
  affiliateUrl: string;
  category: string;
  badge?: string;
}

const GEAR_ITEMS: GearItem[] = [
  // Headsets
  {
    name: "HyperX Cloud II",
    image: "https://m.media-amazon.com/images/I/71yrJMKMDZL._AC_SL1500_.jpg",
    price: "$69.99",
    affiliateUrl: "https://www.amazon.com/dp/B00SAYCXWG?tag=YOUR_TAG",
    category: "headsets",
    badge: "Best Seller",
  },
  {
    name: "SteelSeries Arctis Nova 7",
    image: "https://m.media-amazon.com/images/I/61mx-WjGSTL._AC_SL1500_.jpg",
    price: "$179.99",
    affiliateUrl: "https://www.amazon.com/dp/B0BF56XQGR?tag=YOUR_TAG",
    category: "headsets",
  },
  {
    name: "Logitech G Pro X 2",
    image: "https://m.media-amazon.com/images/I/61UL0oU8YXL._AC_SL1500_.jpg",
    price: "$199.99",
    affiliateUrl: "https://www.amazon.com/dp/B0C7QMPFYS?tag=YOUR_TAG",
    category: "headsets",
  },
  // Mice
  {
    name: "Logitech G Pro X Superlight 2",
    image: "https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SL1500_.jpg",
    price: "$159.99",
    affiliateUrl: "https://www.amazon.com/dp/B0CDB17WDS?tag=YOUR_TAG",
    category: "mice",
    badge: "Top Pick",
  },
  {
    name: "Razer DeathAdder V3",
    image: "https://m.media-amazon.com/images/I/61p2v9COS-L._AC_SL1500_.jpg",
    price: "$89.99",
    affiliateUrl: "https://www.amazon.com/dp/B0BX7M8HCR?tag=YOUR_TAG",
    category: "mice",
  },
  {
    name: "Razer Viper V3 Pro",
    image: "https://m.media-amazon.com/images/I/61IRxXLGVEL._AC_SL1500_.jpg",
    price: "$159.99",
    affiliateUrl: "https://www.amazon.com/dp/B0D2Y9TM2C?tag=YOUR_TAG",
    category: "mice",
  },
  // Keyboards
  {
    name: "Razer Huntsman V3 Pro TKL",
    image: "https://m.media-amazon.com/images/I/71sDDHFKBaL._AC_SL1500_.jpg",
    price: "$249.99",
    affiliateUrl: "https://www.amazon.com/dp/B0D4DML5Z5?tag=YOUR_TAG",
    category: "keyboards",
  },
  {
    name: "Logitech G Pro X TKL",
    image: "https://m.media-amazon.com/images/I/61YfhXMQ0jL._AC_SL1500_.jpg",
    price: "$199.99",
    affiliateUrl: "https://www.amazon.com/dp/B0CTP966NS?tag=YOUR_TAG",
    category: "keyboards",
    badge: "Popular",
  },
  {
    name: "SteelSeries Apex Pro TKL",
    image: "https://m.media-amazon.com/images/I/71mQMKDNDeL._AC_SL1500_.jpg",
    price: "$189.99",
    affiliateUrl: "https://www.amazon.com/dp/B0BF64DN6Y?tag=YOUR_TAG",
    category: "keyboards",
  },
  // Monitors
  {
    name: "ASUS ROG Swift PG27AQN",
    image: "https://m.media-amazon.com/images/I/81lT8FUK3gL._AC_SL1500_.jpg",
    price: "$799.99",
    affiliateUrl: "https://www.amazon.com/dp/B0BZLBJ785?tag=YOUR_TAG",
    category: "monitors",
    badge: "Pro Choice",
  },
  {
    name: "LG 27GP850-B",
    image: "https://m.media-amazon.com/images/I/81mJit2RrfL._AC_SL1500_.jpg",
    price: "$349.99",
    affiliateUrl: "https://www.amazon.com/dp/B093MTSTKD?tag=YOUR_TAG",
    category: "monitors",
  },
  {
    name: "Samsung Odyssey G7",
    image: "https://m.media-amazon.com/images/I/81LXDO4JRCL._AC_SL1500_.jpg",
    price: "$449.99",
    affiliateUrl: "https://www.amazon.com/dp/B088HJ4VQK?tag=YOUR_TAG",
    category: "monitors",
  },
  // Chairs
  {
    name: "Secretlab Titan Evo 2022",
    image: "https://m.media-amazon.com/images/I/71JLU6yTJIL._AC_SL1500_.jpg",
    price: "$519.00",
    affiliateUrl: "https://www.amazon.com/dp/B09P1KJR8K?tag=YOUR_TAG",
    category: "chairs",
  },
  {
    name: "Herman Miller x Logitech Embody",
    image: "https://m.media-amazon.com/images/I/71kv6WZB5BL._AC_SL1500_.jpg",
    price: "$1,795.00",
    affiliateUrl: "https://www.amazon.com/dp/B0C64GM7PM?tag=YOUR_TAG",
    category: "chairs",
    badge: "Premium",
  },
  // Controllers
  {
    name: "Xbox Elite Series 2 Core",
    image: "https://m.media-amazon.com/images/I/71rS5JnzSSL._AC_SL1500_.jpg",
    price: "$129.99",
    affiliateUrl: "https://www.amazon.com/dp/B0B6J3WLMG?tag=YOUR_TAG",
    category: "controllers",
    badge: "Best Value",
  },
  {
    name: "PS5 DualSense Edge",
    image: "https://m.media-amazon.com/images/I/51drTTQRR6L._AC_SL1000_.jpg",
    price: "$199.99",
    affiliateUrl: "https://www.amazon.com/dp/B0BSYFB99D?tag=YOUR_TAG",
    category: "controllers",
  },
  {
    name: "SCUF Reflex Pro",
    image: "https://m.media-amazon.com/images/I/61qSg2SpJRL._AC_SL1500_.jpg",
    price: "$239.99",
    affiliateUrl: "https://www.amazon.com/dp/B09QN3PP7K?tag=YOUR_TAG",
    category: "controllers",
  },
];

const CATEGORIES = [
  { id: "all", icon: Gamepad2 },
  { id: "headsets", icon: Headphones },
  { id: "mice", icon: Mouse },
  { id: "keyboards", icon: Keyboard },
  { id: "monitors", icon: Monitor },
  { id: "chairs", icon: Armchair },
  { id: "controllers", icon: Gamepad2 },
];

export default function GearPage() {
  const t = useTranslations("gear");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? GEAR_ITEMS
    : GEAR_ITEMS.filter((item) => item.category === activeCategory);

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
                  Amazon →
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
