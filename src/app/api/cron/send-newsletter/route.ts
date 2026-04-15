import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deduplicateDeals, getDeals } from "@/lib/cheapshark";
import { sendTopDealsNewsletter } from "@/lib/email";
import type { Deal } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function pickTopDeals(deals: Deal[]): Deal[] {
  return deduplicateDeals(deals)
    .filter((deal) => parseFloat(deal.salePrice) >= 0)
    .sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings))
    .slice(0, 10);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const preview = request.nextUrl.searchParams.get("preview")?.trim().toLowerCase();
    const rawDeals = await getDeals({ pageSize: 40, onSale: true, sortBy: "Deal Rating" });
    const topDeals = pickTopDeals(rawDeals);

    if (topDeals.length === 0) {
      return NextResponse.json({ message: "No deals available to send", sent: 0 });
    }

    if (preview) {
      await sendTopDealsNewsletter({
        to: preview,
        locale: "en",
        unsubscribeToken: "preview",
        deals: topDeals,
      });

      return NextResponse.json({ message: "Preview sent", sent: 1 });
    }

    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, locale, unsubscribe_token")
      .eq("status", "subscribed");

    if (error) throw error;
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers found", sent: 0 });
    }

    let sent = 0;
    const sentAt = new Date().toISOString();

    for (const subscriber of subscribers) {
      try {
        await sendTopDealsNewsletter({
          to: subscriber.email,
          locale: subscriber.locale ?? "en",
          unsubscribeToken: subscriber.unsubscribe_token,
          deals: topDeals,
        });

        await supabase
          .from("newsletter_subscribers")
          .update({ last_sent_at: sentAt })
          .eq("id", subscriber.id);

        sent += 1;
      } catch (sendError) {
        console.error(`Newsletter send failed for ${subscriber.email}:`, sendError);
      }
    }

    return NextResponse.json({
      message: "Newsletter send completed",
      subscribers: subscribers.length,
      sent,
    });
  } catch (error) {
    console.error("Newsletter cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
