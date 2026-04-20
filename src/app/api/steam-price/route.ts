import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_REGION,
  formatRegionalCurrency,
  getRegionOption,
  isRegionCode,
  type RegionCode,
  type RegionalSteamPrice,
} from "@/lib/regional-pricing";

export const revalidate = 3600;

async function fetchUsdExchangeRate(baseCurrency: string): Promise<number | null> {
  if (baseCurrency === "USD") return 1;

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(baseCurrency)}/USD?providers=ECB`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { rate?: number };
    return typeof data.rate === "number" && Number.isFinite(data.rate)
      ? data.rate
      : null;
  } catch {
    return null;
  }
}

function convertMinorUnits(amountMinor: number, rate: number): number {
  const amountMajor = amountMinor / 100;
  return Math.round(amountMajor * rate * 100);
}

function buildUnavailable(appid: number, region: RegionCode): RegionalSteamPrice {
  return {
    appid,
    region,
    currency: getRegionOption(region).currency,
    final: null,
    initial: null,
    discountPercent: 0,
    formattedFinal: null,
    formattedInitial: null,
    isFree: false,
    unavailable: true,
  };
}

export async function GET(request: NextRequest) {
  const appIdParam = request.nextUrl.searchParams.get("appId")?.trim();
  const regionParam = request.nextUrl.searchParams.get("region")?.trim() ?? DEFAULT_REGION;

  if (!appIdParam || !/^\d+$/.test(appIdParam)) {
    return NextResponse.json({ error: "appId required" }, { status: 400 });
  }

  const region = isRegionCode(regionParam) ? regionParam : DEFAULT_REGION;
  const option = getRegionOption(region);
  const appid = Number(appIdParam);

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=${option.countryCode}&l=english`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(buildUnavailable(appid, region));
    }

    const data = (await response.json()) as Record<
      string,
      {
        success?: boolean;
        data?: {
          is_free?: boolean;
          price_overview?: {
            currency: string;
            initial: number;
            final: number;
            discount_percent: number;
          };
        };
      }
    >;

    const app = data[String(appid)];
    if (!app?.success || !app.data) {
      return NextResponse.json(buildUnavailable(appid, region));
    }

    if (app.data.is_free) {
      return NextResponse.json({
        appid,
        region,
        currency: option.currency,
        final: 0,
        initial: 0,
        discountPercent: 0,
        formattedFinal: formatRegionalCurrency(0, region),
        formattedInitial: formatRegionalCurrency(0, region),
        isFree: true,
        unavailable: false,
      } satisfies RegionalSteamPrice);
    }

    const overview = app.data.price_overview;
    if (!overview) {
      return NextResponse.json(buildUnavailable(appid, region));
    }

    let finalMinor = overview.final;
    let initialMinor = overview.initial;
    let outputCurrency = overview.currency || option.currency;

    if (region === "tr" && overview.currency && overview.currency !== option.currency) {
      const exchangeRate = await fetchUsdExchangeRate(overview.currency);

      if (exchangeRate) {
        finalMinor = convertMinorUnits(overview.final, exchangeRate);
        initialMinor = convertMinorUnits(overview.initial, exchangeRate);
        outputCurrency = option.currency;
      }
    }

    return NextResponse.json({
      appid,
      region,
      currency: outputCurrency,
      final: finalMinor,
      initial: initialMinor,
      discountPercent: overview.discount_percent ?? 0,
      formattedFinal: formatRegionalCurrency(finalMinor, region),
      formattedInitial: formatRegionalCurrency(initialMinor, region),
      isFree: finalMinor === 0,
      unavailable: false,
    } satisfies RegionalSteamPrice);
  } catch {
    return NextResponse.json(buildUnavailable(appid, region));
  }
}
