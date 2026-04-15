import { NextRequest, NextResponse } from "next/server";
import { getFallbackDeals } from "@/lib/fallback-data";
import { fetchCheapShark, CHEAPSHARK_BASE } from "@/lib/cheapshark-proxy";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const params = searchParams.toString();
  const url = params
    ? `${CHEAPSHARK_BASE}/deals?${params}`
    : `${CHEAPSHARK_BASE}/deals`;

  try {
    const data = await fetchCheapShark(url, { ttlMs: 5 * 60 * 1000 });
    return NextResponse.json(data, {
      headers: {
        // Edge / CDN cache for 5 min, stale-while-revalidate for 1h
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("CheapShark proxy error:", err);
    const fallback = getFallbackDeals({
      title: searchParams.get("title"),
      storeID: searchParams.get("storeID"),
      upperPrice: searchParams.get("upperPrice"),
      lowerPrice: searchParams.get("lowerPrice"),
      metacritic: searchParams.get("metacritic"),
      onSale: searchParams.get("onSale"),
      sortBy: searchParams.get("sortBy"),
      pageSize: searchParams.get("pageSize"),
      pageNumber: searchParams.get("pageNumber"),
    });
    return NextResponse.json(fallback, {
      headers: { "x-lootscan-fallback": "1" },
    });
  }
}
