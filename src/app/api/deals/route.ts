import { NextRequest, NextResponse } from "next/server";

const CHEAPSHARK_DEALS = "https://www.cheapshark.com/api/1.0/deals";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const url = params ? `${CHEAPSHARK_DEALS}?${params}` : CHEAPSHARK_DEALS;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("CheapShark proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 502 });
  }
}
