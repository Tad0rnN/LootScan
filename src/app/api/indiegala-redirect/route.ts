import { NextRequest, NextResponse } from "next/server";

const AFFILIATE_REF = "nzyzndh";
const FALLBACK = `https://www.indiegala.com/?ref=${AFFILIATE_REF}`;

export async function GET(req: NextRequest) {
  const dealID = req.nextUrl.searchParams.get("dealID");
  if (!dealID) {
    return NextResponse.redirect(FALLBACK);
  }

  try {
    const res = await fetch(`https://www.cheapshark.com/redirect?dealID=${dealID}`, {
      redirect: "manual",
    });

    const location = res.headers.get("location");
    if (location) {
      const url = new URL(location);
      url.searchParams.set("ref", AFFILIATE_REF);
      return NextResponse.redirect(url.toString());
    }
  } catch {
    // fall through to fallback
  }

  return NextResponse.redirect(FALLBACK);
}
