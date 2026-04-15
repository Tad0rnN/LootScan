import { NextRequest, NextResponse } from "next/server";
import { getFallbackGameInfo } from "@/lib/fallback-data";
import { fetchCheapShark, CHEAPSHARK_BASE } from "@/lib/cheapshark-proxy";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id.trim()) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const data = await fetchCheapShark(
      `${CHEAPSHARK_BASE}/games?id=${encodeURIComponent(id)}`,
      { ttlMs: 5 * 60 * 1000, timeoutMs: 15_000 }
    );
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("CheapShark game info error:", error);
    const fallback = getFallbackGameInfo(id);
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: { "x-lootscan-fallback": "1" },
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch game info" },
      { status: 502 }
    );
  }
}
