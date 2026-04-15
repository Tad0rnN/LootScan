import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const locale = (request.nextUrl.searchParams.get("locale") || "en").slice(0, 10);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}?newsletter=invalid`, baseUrl));
  }

  await supabase
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed" })
    .eq("unsubscribe_token", token);

  return NextResponse.redirect(new URL(`/${locale}?newsletter=unsubscribed`, baseUrl));
}
