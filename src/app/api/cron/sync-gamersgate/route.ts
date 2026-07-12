import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchGamersgateFeed, GAMERSGATE_REGIONS } from "@/lib/sources/gamersgate-feed";

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

  const results: Record<string, number | string> = {};

  for (const region of GAMERSGATE_REGIONS) {
    try {
      const rows = await fetchGamersgateFeed(region);
      const now = new Date().toISOString();

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE).map((row) => ({ ...row, updated_at: now }));
        const { error } = await supabase
          .from("gamersgate_deals")
          .upsert(batch, { onConflict: "sku,region" });
        if (error) throw error;
      }

      results[region] = rows.length;
    } catch (err) {
      console.error(`GamersGate sync error (${region}):`, err);
      results[region] = "error";
    }
  }

  return NextResponse.json({ message: "Done", results });
}
