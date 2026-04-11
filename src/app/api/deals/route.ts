import { NextRequest, NextResponse } from "next/server";
import { getFallbackDeals } from "@/lib/fallback-data";

const CHEAPSHARK_DEALS = "https://www.cheapshark.com/api/1.0/deals";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const params = searchParams.toString();
  const url = params ? `${CHEAPSHARK_DEALS}?${params}` : CHEAPSHARK_DEALS;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
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
      return NextResponse.json(fallback, { headers: { "x-lootscan-fallback": "1" } });
    }
    const data = await res.json();
    return NextResponse.json(data);
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
    return NextResponse.json(fallback, { headers: { "x-lootscan-fallback": "1" } });
  }
}
