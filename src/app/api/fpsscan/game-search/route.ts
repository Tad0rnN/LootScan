import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const key = process.env.RAWG_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "RAWG API key not configured" }, { status: 500 });
  }

  const url = `https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(query)}&page_size=10&search_precise=true&ordering=-added`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json({ error: "RAWG API error" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ results: data.results ?? [] });
}
