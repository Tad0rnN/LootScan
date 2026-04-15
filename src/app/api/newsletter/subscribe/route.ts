import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNewsletterWelcome } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      locale?: string;
      signupPath?: string;
      source?: string;
      company?: string;
    };

    if (body.company?.trim()) {
      return NextResponse.json({ code: "accepted" });
    }

    const email = body.email?.trim().toLowerCase() ?? "";
    const locale = (body.locale?.trim() || "en").slice(0, 10);
    const signupPath = (body.signupPath?.trim() || "/").slice(0, 200);
    const source = (body.source?.trim() || "website").slice(0, 100);
    const referrer = (request.headers.get("referer") || "").slice(0, 500);
    const userAgent = (request.headers.get("user-agent") || "").slice(0, 500);

    if (!email || email.length > 320 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("newsletter_subscribers")
      .select("id, status, unsubscribe_token, locale")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.status === "subscribed") {
      return NextResponse.json({ code: "already_subscribed" });
    }

    let unsubscribeToken = existing?.unsubscribe_token as string | undefined;

    if (existing) {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .update({
          status: "subscribed",
          locale,
          source,
          signup_path: signupPath,
          referrer,
          user_agent: userAgent,
          subscribed_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("unsubscribe_token")
        .single();

      if (error) throw error;
      unsubscribeToken = data.unsubscribe_token as string;
    } else {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email,
          locale,
          source,
          signup_path: signupPath,
          referrer,
          user_agent: userAgent,
          status: "subscribed",
        })
        .select("unsubscribe_token")
        .single();

      if (error) throw error;
      unsubscribeToken = data.unsubscribe_token as string;
    }

    if (unsubscribeToken) {
      void sendNewsletterWelcome({
        to: email,
        locale,
        unsubscribeToken,
      }).catch((error) => {
        console.error("Newsletter welcome email failed:", error);
      });
    }

    return NextResponse.json({ code: "subscribed" });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Could not complete the subscription right now." },
      { status: 500 }
    );
  }
}
