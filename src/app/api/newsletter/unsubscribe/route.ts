import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: show confirmation page — does NOT unsubscribe yet.
// This prevents email pre-fetchers/scanners from triggering unsubscribe.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const locale = (request.nextUrl.searchParams.get("locale") || "en").slice(0, 10);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}?newsletter=invalid`, baseUrl));
  }

  return NextResponse.redirect(
    new URL(`/${locale}?newsletter=confirm-unsubscribe&token=${encodeURIComponent(token)}`, baseUrl)
  );
}

// POST: perform the actual unsubscribe after user confirms on the page.
export async function POST(request: NextRequest) {
  const locale = (request.nextUrl.searchParams.get("locale") || "en").slice(0, 10);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  let token: string | null = null;
  try {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token : null;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed" })
    .eq("unsubscribe_token", token);

  if (error) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }

  return NextResponse.redirect(new URL(`/${locale}?newsletter=unsubscribed`, baseUrl));
}
