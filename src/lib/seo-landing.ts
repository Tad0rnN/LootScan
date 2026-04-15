/**
 * Curated SEO landing pages.
 *
 * Each entry produces a static URL like /[locale]/deals/[slug]
 * that renders a themed deals list with proper <title>, meta
 * description, Open Graph, and a localized intro. Add more
 * entries as you discover high-value long-tail queries in
 * Search Console.
 */

export interface DealFilter {
  onSale?: boolean;
  upperPrice?: number;
  lowerPrice?: number;
  metacritic?: number;
  sortBy?: string;
  title?: string;
  steamworks?: boolean;
  pageSize?: number;
}

export interface SeoCopy {
  title: string;       // <title> and H1
  description: string; // meta description (≤ 160 chars ideally)
  intro: string;       // short paragraph shown on the page
}

export interface SeoLanding {
  slug: string;
  filter: DealFilter;
  /** Copy per-locale. Falls back to "en" if a locale is missing. */
  copy: Record<string, SeoCopy>;
}

export const SEO_LANDING_PAGES: SeoLanding[] = [
  {
    slug: "free-games-this-week",
    filter: { upperPrice: 0, sortBy: "recent", pageSize: 48 },
    copy: {
      en: {
        title: "Free Games This Week — Claim Now | LootScan",
        description:
          "The best free PC games you can grab right now on Steam, Epic, GOG and more. Updated every hour.",
        intro:
          "Completely free PC games available this week across every major store. Prices and giveaways are refreshed hourly.",
      },
      tr: {
        title: "Bu Hafta Bedava Oyunlar — Hemen Kap | LootScan",
        description:
          "Steam, Epic, GOG ve daha fazlasında bu hafta ücretsiz PC oyunları. Her saat güncellenir.",
        intro:
          "Bu hafta tüm büyük mağazalarda tamamen ücretsiz dağıtılan PC oyunları. Fırsatlar saatlik güncellenir.",
      },
      de: {
        title: "Kostenlose Spiele diese Woche | LootScan",
        description:
          "Die besten kostenlosen PC-Spiele, die du jetzt auf Steam, Epic, GOG und mehr bekommst. Stündlich aktualisiert.",
        intro:
          "Komplett kostenlose PC-Spiele aus allen großen Stores, stündlich aktualisiert.",
      },
      nl: {
        title: "Gratis games deze week | LootScan",
        description:
          "De beste gratis PC-games die je deze week kunt claimen op Steam, Epic, GOG en meer.",
        intro:
          "Volledig gratis PC-games uit alle grote stores, elk uur ververst.",
      },
    },
  },
  {
    slug: "under-10-dollars",
    filter: { upperPrice: 10, onSale: true, sortBy: "Savings", pageSize: 48 },
    copy: {
      en: {
        title: "Best PC Games Under $10 — Cheap Deals | LootScan",
        description:
          "Top-rated PC games you can grab for less than $10 right now. Hand-ranked by savings percentage.",
        intro:
          "Every PC game we can find under $10 on sale, sorted by biggest discount first.",
      },
      tr: {
        title: "10 Dolar Altı En İyi PC Oyunları | LootScan",
        description:
          "10 dolardan ucuz, en yüksek puanlı PC oyunları. İndirim yüzdesine göre sıralanmış.",
        intro:
          "İndirimde 10 doların altındaki tüm PC oyunları, en büyük indirimden en küçüğüne.",
      },
      de: {
        title: "Beste PC-Spiele unter 10 $ | LootScan",
        description:
          "Top-PC-Spiele, die du gerade für unter 10 $ bekommst, sortiert nach Rabatt.",
        intro:
          "Alle PC-Spiele im Angebot unter 10 $, sortiert nach größtem Rabatt.",
      },
    },
  },
  {
    slug: "best-aaa-deals",
    filter: {
      onSale: true,
      metacritic: 80,
      lowerPrice: 5,
      sortBy: "Savings",
      pageSize: 48,
    },
    copy: {
      en: {
        title: "Best AAA Game Deals Right Now | LootScan",
        description:
          "Metacritic 80+ AAA games on sale across every major PC store. Compare prices instantly.",
        intro:
          "Critically acclaimed AAA titles (Metacritic 80+) currently discounted. Updated continuously.",
      },
      tr: {
        title: "En İyi AAA Oyun İndirimleri | LootScan",
        description:
          "Metacritic 80+ AAA oyunları tüm büyük PC mağazalarında indirimde. Fiyatları anında karşılaştır.",
        intro:
          "Eleştirmenlerce övülmüş (Metacritic 80+) AAA oyunları indirimli. Sürekli güncellenir.",
      },
      de: {
        title: "Beste AAA-Spiele-Deals jetzt | LootScan",
        description:
          "Metacritic-80+-AAA-Spiele im Angebot in allen großen PC-Stores. Preise sofort vergleichen.",
        intro:
          "Von der Kritik gefeierte AAA-Titel (Metacritic 80+) aktuell im Angebot.",
      },
    },
  },
  {
    slug: "steam-sales",
    filter: { storeID: "1", onSale: true, sortBy: "Savings", pageSize: 48 } as DealFilter & { storeID?: string },
    copy: {
      en: {
        title: "Steam Sales — Every Discounted Game | LootScan",
        description:
          "Every Steam game currently on sale, ranked by biggest discount first. Updated hourly.",
        intro:
          "Live feed of every PC game currently discounted on Steam, sorted by savings.",
      },
      tr: {
        title: "Steam İndirimleri — Tüm İndirimli Oyunlar | LootScan",
        description:
          "Steam'de şu an indirimde olan tüm oyunlar, en büyük indirimden başlayarak. Saatlik güncellenir.",
        intro:
          "Steam'de indirimli tüm PC oyunlarının canlı listesi, indirim yüzdesine göre sıralı.",
      },
      de: {
        title: "Steam-Angebote — Alle reduzierten Spiele | LootScan",
        description:
          "Alle Steam-Spiele im Angebot, sortiert nach größtem Rabatt. Stündlich aktualisiert.",
        intro:
          "Live-Feed aller PC-Spiele, die aktuell bei Steam reduziert sind.",
      },
    },
  },
];

export function findSeoLanding(slug: string): SeoLanding | undefined {
  return SEO_LANDING_PAGES.find((p) => p.slug === slug);
}

export function getSeoCopy(landing: SeoLanding, locale: string): SeoCopy {
  return landing.copy[locale] ?? landing.copy.en;
}
