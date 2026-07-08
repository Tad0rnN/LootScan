/**
 * Shared SEO helpers: canonical + hreflang alternates and JSON-LD
 * structured-data builders. Centralised so every route emits
 * consistent, valid metadata instead of duplicating the logic.
 */
import { routing } from "@/i18n/routing";

export const SITE = "https://lootscan.co";
export const SITE_NAME = "LootScan";

/**
 * Build canonical + hreflang alternates for a given locale/path.
 * `path` must start with a slash and exclude the locale segment,
 * e.g. "/deals" or "/game/123". Use "" for the locale root.
 */
export function buildAlternates(locale: string, path: string = "") {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE}/${l}${path}`;
  }
  // x-default points at the default locale for un-targeted users.
  languages["x-default"] = `${SITE}/${routing.defaultLocale}${path}`;

  return {
    canonical: `${SITE}/${locale}${path}`,
    languages,
  };
}

type JsonLdObject = Record<string, unknown>;

/** Organization identity — reused across pages. */
export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE,
    logo: `${SITE}/icon.svg`,
    description:
      "Game price comparison across Steam, Epic, GOG and every major PC store.",
  };
}

/** WebSite + SearchAction — enables the Google sitelinks searchbox. */
export function websiteSchema(locale: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface ProductSchemaInput {
  name: string;
  description: string;
  image?: string;
  url: string;
  lowPrice: number;
  highPrice: number;
  offerCount: number;
  currency?: string;
}

/** Product + AggregateOffer — the core rich-result surface for a game. */
export function productSchema(input: ProductSchemaInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    ...(input.image ? { image: input.image } : {}),
    url: input.url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: input.currency ?? "USD",
      lowPrice: input.lowPrice.toFixed(2),
      highPrice: input.highPrice.toFixed(2),
      offerCount: input.offerCount,
      availability: "https://schema.org/InStock",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ItemListEntry {
  name: string;
  url: string;
}

/** ItemList — helps a curated deals page qualify as a list rich result. */
export function itemListSchema(
  name: string,
  entries: ItemListEntry[]
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      url: entry.url,
    })),
  };
}
