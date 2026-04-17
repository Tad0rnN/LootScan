"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_REGION,
  getRegionOption,
  isRegionCode,
  type RegionCode,
  type RegionalSteamPrice,
} from "@/lib/regional-pricing";

const STORAGE_KEY = "lootscan-region";
const EVENT_NAME = "lootscan-region-change";

function readRegion(): RegionCode {
  if (typeof window === "undefined") return DEFAULT_REGION;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value && isRegionCode(value) ? value : DEFAULT_REGION;
}

export function setStoredRegion(region: RegionCode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, region);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: region }));
}

export function useRegionalPricing() {
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION);

  useEffect(() => {
    setRegion(readRegion());

    const sync = () => setRegion(readRegion());
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) sync();
    };

    window.addEventListener(EVENT_NAME, sync as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, sync as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    region,
    regionOption: getRegionOption(region),
    setRegion: setStoredRegion,
  };
}

const steamPriceCache = new Map<string, Promise<RegionalSteamPrice | null>>();

export function fetchRegionalSteamPriceClient(appId: string | number, region: RegionCode) {
  const cacheKey = `${appId}-${region}`;
  const existing = steamPriceCache.get(cacheKey);
  if (existing) return existing;

  const promise = fetch(`/api/steam-price?appId=${encodeURIComponent(String(appId))}&region=${region}`)
    .then(async (response) => {
      if (!response.ok) return null;
      return (await response.json()) as RegionalSteamPrice;
    })
    .catch(() => null);

  steamPriceCache.set(cacheKey, promise);
  return promise;
}
