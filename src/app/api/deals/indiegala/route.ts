import { NextRequest, NextResponse } from "next/server";
import { getIndiegalaDeals } from "@/lib/indiegala-deals";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const pageSize = sp.get("pageSize") ? Number(sp.get("pageSize")) : 24;
  const pageNumber = sp.get("pageNumber") ? Number(sp.get("pageNumber")) : 0;

  try {
    const deals = await getIndiegalaDeals({
      title: sp.get("title") ?? undefined,
      onSale: sp.get("onSale") === "1",
      upperPrice: sp.get("upperPrice") ? Number(sp.get("upperPrice")) : undefined,
      lowerPrice: sp.get("lowerPrice") ? Number(sp.get("lowerPrice")) : undefined,
      sortBy: sp.get("sortBy") ?? undefined,
      limit: pageSize,
      offset: pageNumber * pageSize,
    });

    return NextResponse.json(deals, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("IndieGala deals API error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
