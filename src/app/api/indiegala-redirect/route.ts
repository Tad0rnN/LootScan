import { NextRequest, NextResponse } from "next/server";
import https from "node:https";

const AFFILIATE_REF = "nzyzndh";
const FALLBACK = `https://www.indiegala.com/?ref=${AFFILIATE_REF}`;

function getRedirectLocation(dealID: string): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "www.cheapshark.com",
        path: `/redirect?dealID=${encodeURIComponent(dealID)}`,
        method: "GET",
      },
      (res) => {
        resolve(res.headers.location ?? null);
        res.resume();
      }
    );
    req.on("error", () => resolve(null));
    req.setTimeout(8000, () => { req.destroy(); resolve(null); });
    req.end();
  });
}

export async function GET(req: NextRequest) {
  const dealID = req.nextUrl.searchParams.get("dealID");
  if (!dealID) return NextResponse.redirect(FALLBACK);

  const location = await getRedirectLocation(dealID);
  if (location) {
    try {
      const url = new URL(location);
      url.searchParams.set("ref", AFFILIATE_REF);
      return NextResponse.redirect(url.toString());
    } catch {
      // invalid URL, fall through
    }
  }

  return NextResponse.redirect(FALLBACK);
}
