import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") ?? "";
  if (!title.trim()) return NextResponse.json([]);

  const res = await fetch(
    `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=30`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return NextResponse.json([], { status: 502 });
  const data = await res.json();
  return NextResponse.json(data);
}
