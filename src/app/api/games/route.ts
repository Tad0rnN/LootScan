import { NextRequest, NextResponse } from "next/server";
import { searchFallbackGames } from "@/lib/fallback-data";
import { fetchCheapShark, CHEAPSHARK_BASE } from "@/lib/cheapshark-proxy";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") ?? "";
  if (!title.trim()) return NextResponse.json([]);

  try {
    const data = await fetchCheapShark(
      `${CHEAPSHARK_BASE}/games?title=${encodeURIComponent(title)}&limit=30`,
      { ttlMs: 10 * 60 * 1000, timeoutMs: 15_000 }
    );
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("CheapShark game search error:", error);
    return NextResponse.json(searchFallbackGames(title), {
      headers: { "x-lootscan-fallback": "1" },
    });
  }
}
