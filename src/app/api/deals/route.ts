import { NextRequest, NextResponse } from "next/server";
import { getDeals, deduplicateDeals } from "@/lib/cheapshark";
import type { Deal } from "@/types";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const storeID   = p.get("storeID")    ?? undefined;
  const sortBy    = p.get("sortBy")     ?? undefined;
  const upperPrice = p.get("upperPrice") ? parseFloat(p.get("upperPrice")!) : undefined;
  const lowerPrice = p.get("lowerPrice") ? parseFloat(p.get("lowerPrice")!) : undefined;
  const metacritic = p.get("metacritic") ? parseInt(p.get("metacritic")!)   : undefined;
  const title     = p.get("title")      ?? undefined;
  const onSale    = p.get("onSale") === "1";
  const page      = parseInt(p.get("page") ?? "0");

  const hasFilters = !!(storeID || sortBy || title || metacritic || upperPrice || lowerPrice || onSale);

  try {
    let deals: Deal[];

    if (hasFilters || page > 0) {
      const hasStoreFilter = !!storeID;
      const fetchSize = hasStoreFilter ? 24 : 60;
      const raw = await getDeals({ storeID, sortBy, upperPrice, lowerPrice, metacritic, title, onSale, pageNumber: page, pageSize: fetchSize });
      deals = hasStoreFilter ? raw : deduplicateDeals(raw).slice(0, 24);
    } else {
      const startPage = Math.floor(Math.random() * 6);
      const [b1, b2] = await Promise.all([
        getDeals({ steamRating: 70, sortBy: "DealRating", pageSize: 60, pageNumber: startPage }),
        getDeals({ steamRating: 70, sortBy: "DealRating", pageSize: 60, pageNumber: startPage + 1 }),
      ]);
      deals = shuffleArray(deduplicateDeals([...b1, ...b2])).slice(0, 24);
    }

    return NextResponse.json({ deals, page });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 502 });
  }
}
