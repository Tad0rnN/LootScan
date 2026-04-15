import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SEO_LANDING_PAGES } from "@/lib/seo-landing";
import { getDeals, deduplicateDeals } from "@/lib/cheapshark";

const SITE = "https://lootscan.co";

// Cache this sitemap for 1 hour
export const revalidate = 3600;

const STATIC_PATHS = [
  "",
  "/deals",
  "/free",
  "/popular",
  "/search",
  "/gear",
  "/browse",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages × locales
  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${SITE}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "hourly",
        priority: path === "" ? 1.0 : 0.7,
      });
    }
  }

  // Curated SEO landing pages × locales
  for (const locale of routing.locales) {
    for (const landing of SEO_LANDING_PAGES) {
      entries.push({
        url: `${SITE}/${locale}/deals/${landing.slug}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }
  }

  // Top game detail pages (best-effort; fails silently if CheapShark is down)
  try {
    const deals = await getDeals({
      pageSize: 60,
      sortBy: "Deal Rating",
      onSale: true,
    });
    const unique = deduplicateDeals(deals);
    for (const deal of unique) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE}/${locale}/game/${deal.gameID}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.6,
        });
      }
    }
  } catch {
    // swallow — sitemap is still valid without game pages
  }

  return entries;
}
