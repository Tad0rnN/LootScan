import { NextResponse } from "next/server";
import type { SteamGame, SteamGameWithImage } from "@/lib/steam";

export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks", {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return NextResponse.json([]);

    const data: Record<string, SteamGame> = await res.json();
    const games: SteamGameWithImage[] = Object.values(data)
      .filter((g) => g.name && g.appid)
      .slice(0, 40)
      .map((g) => ({
        ...g,
        headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
        reviewScore: g.positive + g.negative > 0
          ? Math.round((g.positive / (g.positive + g.negative)) * 100)
          : 0,
      }));

    return NextResponse.json(games);
  } catch {
    return NextResponse.json([]);
  }
}
