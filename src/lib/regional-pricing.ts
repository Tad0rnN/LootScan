export type RegionCode = "eu" | "tr";

export interface RegionOption {
  code: RegionCode;
  label: string;
  shortLabel: string;
  countryCode: string;
  currency: string;
  locale: string;
  flag: string;
}

export interface RegionalSteamPrice {
  appid: number;
  region: RegionCode;
  currency: string;
  final: number | null;
  initial: number | null;
  discountPercent: number;
  formattedFinal: string | null;
  formattedInitial: string | null;
  isFree: boolean;
  unavailable: boolean;
}

export const REGION_OPTIONS: RegionOption[] = [
  {
    code: "eu",
    label: "Europe (EUR)",
    shortLabel: "EU",
    countryCode: "de",
    currency: "EUR",
    locale: "de-DE",
    flag: "🇪🇺",
  },
  {
    code: "tr",
    label: "Turkey (USD)",
    shortLabel: "TR",
    countryCode: "tr",
    currency: "USD",
    locale: "en-US",
    flag: "🇹🇷",
  },
];

export const DEFAULT_REGION: RegionCode = "eu";

export function getRegionOption(region: RegionCode): RegionOption {
  return REGION_OPTIONS.find((item) => item.code === region) ?? REGION_OPTIONS[0];
}

export function isRegionCode(value: string): value is RegionCode {
  return value === "eu" || value === "tr";
}

export function formatRegionalCurrency(amountMinor: number, region: RegionCode): string {
  const option = getRegionOption(region);
  return new Intl.NumberFormat(option.locale, {
    style: "currency",
    currency: option.currency,
  }).format(amountMinor / 100);
}
