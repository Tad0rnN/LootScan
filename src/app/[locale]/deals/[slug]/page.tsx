import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { routing } from "@/i18n/routing";
import {
  SEO_LANDING_PAGES,
  findSeoLanding,
  getSeoCopy,
} from "@/lib/seo-landing";
import { getDeals, deduplicateDeals } from "@/lib/cheapshark";
import DealCard from "@/components/DealCard";
import JsonLd from "@/components/JsonLd";
import {
  SITE,
  buildAlternates,
  itemListSchema,
  breadcrumbSchema,
} from "@/lib/seo";

// Regenerate at most once per 5 min
export const revalidate = 300;

// Pre-generate every (locale, slug) combination at build time
export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const page of SEO_LANDING_PAGES) {
      params.push({ locale, slug: page.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const landing = findSeoLanding(slug);
  if (!landing) return {};
  const copy = getSeoCopy(landing, locale);

  const alternates = buildAlternates(locale, `/deals/${slug}`);

  return {
    // copy.title already ends with "| LootScan" — use absolute to
    // avoid the layout template appending the suffix a second time.
    title: { absolute: copy.title },
    description: copy.description,
    alternates,
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: alternates.canonical,
      siteName: "LootScan",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
  };
}

export default async function SeoDealsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const landing = findSeoLanding(slug);
  if (!landing) notFound();
  const copy = getSeoCopy(landing, locale);

  let deals: Awaited<ReturnType<typeof getDeals>> = [];
  try {
    const raw = await getDeals(landing.filter);
    deals = deduplicateDeals(raw);
  } catch {
    deals = [];
  }

  const pageTitle = copy.title.split(" | ")[0];
  const structuredData: Array<Record<string, unknown>> = [
    breadcrumbSchema([
      { name: "Home", url: `${SITE}/${locale}` },
      { name: "Deals", url: `${SITE}/${locale}/deals` },
      { name: pageTitle, url: `${SITE}/${locale}/deals/${slug}` },
    ]),
  ];
  if (deals.length > 0) {
    structuredData.push(
      itemListSchema(
        pageTitle,
        deals.slice(0, 30).map((deal) => ({
          name: deal.title,
          url: `${SITE}/${locale}/game/${deal.gameID}`,
        }))
      )
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={structuredData} />
      <Link
        href={`/${locale}/deals`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All deals
      </Link>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {copy.title.split(" | ")[0]}
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">{copy.intro}</p>
        <p className="text-slate-600 text-xs mt-3">
          {deals.length} games · updated every 5 minutes
        </p>
      </header>

      {deals.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400">
            No games match this selection right now. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {deals.map((deal) => (
            <DealCard key={deal.dealID} deal={deal} />
          ))}
        </div>
      )}

      {/* Cross-link to other curated pages for internal SEO */}
      <section className="mt-16 pt-8 border-t border-white/5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          More curated deals
        </h2>
        <div className="flex flex-wrap gap-2">
          {SEO_LANDING_PAGES.filter((p) => p.slug !== slug).map((p) => (
            <Link
              key={p.slug}
              href={`/${locale}/deals/${p.slug}`}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-colors"
            >
              {getSeoCopy(p, locale).title.split(" | ")[0]}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
