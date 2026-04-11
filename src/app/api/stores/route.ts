import { NextResponse } from "next/server";
import { getStores } from "@/lib/cheapshark";
import { fallbackStores } from "@/lib/fallback-data";

export async function GET() {
  try {
    const stores = await getStores();
    return NextResponse.json(stores.filter((s) => s.isActive === 1));
  } catch {
    return NextResponse.json(fallbackStores, { headers: { "x-lootscan-fallback": "1" } });
  }
}
