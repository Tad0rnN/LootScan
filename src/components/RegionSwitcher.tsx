"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { REGION_OPTIONS } from "@/lib/regional-pricing";
import { useRegionalPricing } from "@/lib/regional-pricing-client";
import clsx from "clsx";

export default function RegionSwitcher() {
  const { region, regionOption, setRegion } = useRegionalPricing();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 h-9 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        title="Regional pricing"
      >
        <span className="text-sm leading-none">{regionOption.flag}</span>
        <MapPin className="w-3.5 h-3.5" />
        <span className="hidden lg:inline text-xs font-medium">{regionOption.shortLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          {REGION_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                setRegion(option.code);
                setOpen(false);
              }}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left",
                option.code === region
                  ? "text-brand-400 bg-brand-500/10"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-base">{option.flag}</span>
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-[11px] text-slate-500">{option.currency}</p>
              </div>
              {option.code === region && <span className="text-brand-500 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
