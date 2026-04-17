"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { RegionalSteamPrice } from "@/lib/regional-pricing";
import { fetchRegionalSteamPriceClient, useRegionalPricing } from "@/lib/regional-pricing-client";

interface Props {
  appId?: string | number | null;
  compact?: boolean;
  className?: string;
}

export default function RegionalSteamPrice({ appId, compact = false, className }: Props) {
  const { regionOption, region } = useRegionalPricing();
  const [price, setPrice] = useState<RegionalSteamPrice | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!appId) {
      setPrice(null);
      return;
    }

    fetchRegionalSteamPriceClient(appId, region).then((data) => {
      if (!cancelled) setPrice(data);
    });

    return () => {
      cancelled = true;
    };
  }, [appId, region]);

  if (!appId || !price || price.unavailable || !price.formattedFinal) return null;

  const content = (
    <>
      <span className="font-medium text-slate-400">
        {regionOption.shortLabel} Steam:
      </span>
      <span className="text-slate-200">
        {price.isFree ? "Free" : price.formattedFinal}
      </span>
      {price.formattedInitial && price.discountPercent > 0 && !price.isFree && (
        <span className="text-slate-600 line-through">
          {price.formattedInitial}
        </span>
      )}
    </>
  );

  if (compact) {
    return (
      <div className={clsx("flex items-center gap-1.5 text-[11px]", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={clsx("flex flex-wrap items-center gap-2 text-sm", className)}>
      {content}
    </div>
  );
}
