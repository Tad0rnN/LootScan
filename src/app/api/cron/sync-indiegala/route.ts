import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchIndiegalaFeed } from "@/lib/sources/indiegala-feed";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_SIZE = 500;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await fetchIndiegalaFeed();
    const now = new Date().toISOString();

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE).map((row) => ({ ...row, updated_at: now }));
      const { error } = await supabase.from("indiegala_deals").upsert(batch, { onConflict: "sku" });
      if (error) throw error;
    }

    return NextResponse.json({ message: "Done", count: rows.length });
  } catch (err) {
    console.error("IndieGala sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
