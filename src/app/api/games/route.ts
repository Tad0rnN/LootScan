import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") ?? "";
  if (!title.trim()) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=30`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return NextResponse.json([], { status: 502 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("CheapShark game search error:", error);
    return NextResponse.json([], { status: 502 });
  }
}
