import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSaleAlert } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: items, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("notify_on_sale", true);

    if (error) throw error;
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "No items to check", notified: 0 });
    }

    let notified = 0;

    // Her oyunun fiyatını bir kez çek (cache)
    const priceCache = new Map<string, { salePrice: string; savings: string; dealID: string } | null>();

    for (const item of items) {
      try {
        // Fiyatı cache'den al ya da çek
        if (!priceCache.has(item.game_id)) {
          const res = await fetch(
            `https://www.cheapshark.com/api/1.0/games?id=${item.game_id}`,
            { cache: "no-store" }
          );
          if (!res.ok) { priceCache.set(item.game_id, null); continue; }
          const gameInfo = await res.json();
          const deals: Array<{ price: string; savings: string; dealID: string }> = gameInfo.deals ?? [];
          if (deals.length === 0) { priceCache.set(item.game_id, null); continue; }
          const cheapest = deals.reduce((a, b) => parseFloat(a.price) < parseFloat(b.price) ? a : b);
          priceCache.set(item.game_id, {
            salePrice: cheapest.price,
            savings: cheapest.savings,
            dealID: cheapest.dealID,
          });
        }

        const cheapest = priceCache.get(item.game_id);
        if (!cheapest) continue;

        const savings = Math.round(parseFloat(cheapest.savings));
        const currentPrice = parseFloat(cheapest.salePrice);
        const normalPrice = parseFloat(item.normal_price);
        const isOnSale = savings >= 5 && currentPrice < normalPrice;
        if (!isOnSale) continue;

        // Son 24 saat içinde bildirim gönderildiyse atla
        if (item.last_notified_at) {
          const hoursSince = (Date.now() - new Date(item.last_notified_at).getTime()) / 3600000;
          if (hoursSince < 24) continue;
        }

        // Kullanıcı emailini al
        const { data: userData } = await supabase.auth.admin.getUserById(item.user_id);
        const email = userData?.user?.email;
        if (!email) continue;

        await sendSaleAlert({
          to: email,
          gameTitle: item.game_title,
          gameThumb: item.game_thumb,
          gameID: item.game_id,
          normalPrice: item.normal_price,
          salePrice: cheapest.salePrice,
          savings,
          dealID: cheapest.dealID,
        });

        await supabase
          .from("wishlist")
          .update({ current_price: cheapest.salePrice, last_notified_at: new Date().toISOString() })
          .eq("id", item.id);

        notified++;
      } catch (e) {
        console.error(`Error processing item ${item.id}:`, e);
      }
    }

    return NextResponse.json({ message: "Done", total: items.length, notified });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
