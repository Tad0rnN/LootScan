import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id.trim()) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://www.cheapshark.com/api/1.0/games?id=${encodeURIComponent(id)}`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(15000) }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("CheapShark game info error:", error);
    return NextResponse.json({ error: "Failed to fetch game info" }, { status: 502 });
  }
}
