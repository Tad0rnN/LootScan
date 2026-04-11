import { NextResponse } from "next/server";
import { getStores } from "@/lib/cheapshark";

export async function GET() {
  try {
    const stores = await getStores();
    return NextResponse.json(stores.filter((s) => s.isActive === 1));
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
