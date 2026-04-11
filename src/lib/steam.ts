export interface SteamGame {
  appid: number;
  name: string;
  developer: string;
  publisher: string;
  positive: number;
  negative: number;
  owners: string;
  average_2weeks: number; // dakika cinsinden ortalama playtime (son 2 hafta)
  median_2weeks: number;
  price: string;          // cent cinsinden (örn. "1999" = $19.99)
  initialprice: string;
  discount: string;       // yüzde olarak ("0", "33" vb.)
  ccu: number;            // peak concurrent users
}

export interface SteamGameWithImage extends SteamGame {
  headerImage: string;
  reviewScore: number;    // 0-100 arası
}

// SteamSpy top 100 son 2 haftada en çok oynanan
export async function getTopSteamGames(): Promise<SteamGameWithImage[]> {
  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks", {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const data: Record<string, SteamGame> = await res.json();

    return Object.values(data)
      .filter((g) => g.name && g.appid)
      .slice(0, 40)
      .map((g) => ({
        ...g,
        headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
        reviewScore: g.positive + g.negative > 0
          ? Math.round((g.positive / (g.positive + g.negative)) * 100)
          : 0,
      }));
  } catch {
    return [];
  }
}

export function formatSteamPrice(price: string, initialprice: string, discount: string): {
  current: string;
  original: string;
  isFree: boolean;
  hasDiscount: boolean;
  discountPct: number;
} {
  const currentNum = parseInt(price ?? "0");
  const initialNum = parseInt(initialprice ?? "0");
  const discountNum = parseInt(discount ?? "0");

  const isFree = currentNum === 0 && initialNum === 0;
  const hasDiscount =
    discountNum > 0 || (initialNum > 0 && initialNum > currentNum);
  const effectiveDiscount =
    discountNum ||
    (initialNum > currentNum && initialNum > 0
      ? Math.round((1 - currentNum / initialNum) * 100)
      : 0);

  return {
    current: isFree ? "FREE" : `$${(currentNum / 100).toFixed(2)}`,
    original: `$${(initialNum / 100).toFixed(2)}`,
    isFree,
    hasDiscount,
    discountPct: effectiveDiscount,
  };
}

export function formatPlaytime(minutes: number): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.round(minutes / 60);
  return `${h}h`;
}
