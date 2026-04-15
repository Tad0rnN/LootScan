import { NextResponse } from "next/server";
import { fallbackStores } from "@/lib/fallback-data";
import { fetchCheapShark, CHEAPSHARK_BASE } from "@/lib/cheapshark-proxy";
import type { Store } from "@/types";

export async function GET() {
  try {
    // Stores almost never change — cache 1 hour
    const stores = await fetchCheapShark<Store[]>(
      `${CHEAPSHARK_BASE}/stores`,
      { ttlMs: 60 * 60 * 1000 }
    );
    return NextResponse.json(stores.filter((s) => s.isActive === 1), {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(fallbackStores, {
      headers: { "x-lootscan-fallback": "1" },
    });
  }
}
