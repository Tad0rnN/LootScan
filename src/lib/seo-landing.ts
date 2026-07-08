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
  storeID?: string;
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
    filter: { storeID: "1", onSale: true, sortBy: "Savings", pageSize: 48 },
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
  {
    slug: "under-5-dollars",
    filter: { upperPrice: 5, onSale: true, sortBy: "Savings", pageSize: 48 },
    copy: {
      en: {
        title: "Best PC Games Under $5 — Cheap Deals | LootScan",
        description:
          "Great PC games you can grab for under $5 right now, ranked by biggest discount. Updated continuously.",
        intro:
          "Every PC game we can find under $5 on sale, sorted by biggest discount first.",
      },
      tr: {
        title: "5 Dolar Altı En İyi PC Oyunları | LootScan",
        description:
          "5 dolardan ucuz PC oyunları, en büyük indirimden başlayarak sıralanmış. Sürekli güncellenir.",
        intro:
          "İndirimde 5 doların altındaki tüm PC oyunları, en büyük indirimden en küçüğüne.",
      },
      de: {
        title: "Beste PC-Spiele unter 5 $ | LootScan",
        description:
          "Top-PC-Spiele für unter 5 $, sortiert nach größtem Rabatt. Laufend aktualisiert.",
        intro:
          "Alle PC-Spiele im Angebot unter 5 $, sortiert nach größtem Rabatt.",
      },
    },
  },
  {
    slug: "under-20-dollars",
    filter: { upperPrice: 20, onSale: true, sortBy: "Savings", pageSize: 48 },
    copy: {
      en: {
        title: "Best PC Games Under $20 — Deals | LootScan",
        description:
          "Top PC games under $20 on sale across Steam, Epic, GOG and more. Compare prices instantly.",
        intro:
          "Every PC game under $20 currently on sale, sorted by biggest discount.",
      },
      tr: {
        title: "20 Dolar Altı En İyi PC Oyunları | LootScan",
        description:
          "Steam, Epic, GOG ve daha fazlasında 20 dolar altı indirimli PC oyunları. Fiyatları anında karşılaştır.",
        intro:
          "Şu an indirimde olan 20 dolar altı tüm PC oyunları, en büyük indirime göre sıralı.",
      },
      de: {
        title: "Beste PC-Spiele unter 20 $ | LootScan",
        description:
          "Top-PC-Spiele unter 20 $ im Angebot bei Steam, Epic, GOG und mehr. Preise sofort vergleichen.",
        intro:
          "Alle PC-Spiele unter 20 $ aktuell im Angebot, sortiert nach größtem Rabatt.",
      },
    },
  },
  {
    slug: "biggest-discounts",
    filter: { onSale: true, sortBy: "Savings", pageSize: 48 },
    copy: {
      en: {
        title: "Biggest Game Discounts Right Now | LootScan",
        description:
          "The steepest PC game discounts across every major store, ranked by savings percentage. Updated continuously.",
        intro:
          "Live ranking of the biggest PC game discounts we can find, highest savings first.",
      },
      tr: {
        title: "Şu Anki En Büyük Oyun İndirimleri | LootScan",
        description:
          "Tüm büyük mağazalarda en yüksek indirimli PC oyunları, indirim yüzdesine göre sıralı. Sürekli güncellenir.",
        intro:
          "Bulabildiğimiz en büyük PC oyun indirimlerinin canlı sıralaması, en yükseğinden başlayarak.",
      },
      de: {
        title: "Größte Spiele-Rabatte gerade jetzt | LootScan",
        description:
          "Die höchsten PC-Spiele-Rabatte in allen großen Stores, sortiert nach Rabatt. Laufend aktualisiert.",
        intro:
          "Live-Rangliste der größten PC-Spiele-Rabatte, die wir finden können.",
      },
    },
  },
  {
    slug: "top-rated-deals",
    filter: { onSale: true, metacritic: 85, sortBy: "Metacritic", pageSize: 48 },
    copy: {
      en: {
        title: "Top-Rated Game Deals (Metacritic 85+) | LootScan",
        description:
          "Critically acclaimed PC games (Metacritic 85+) currently on sale. Compare prices across every store.",
        intro:
          "The highest-rated PC games (Metacritic 85+) currently discounted, ranked by score.",
      },
      tr: {
        title: "En Yüksek Puanlı Oyun İndirimleri (Metacritic 85+) | LootScan",
        description:
          "Eleştirmenlerce övülen PC oyunları (Metacritic 85+) şu an indirimde. Tüm mağazalarda fiyatları karşılaştır.",
        intro:
          "Şu an indirimli en yüksek puanlı PC oyunları (Metacritic 85+), puana göre sıralı.",
      },
      de: {
        title: "Bestbewertete Spiele-Deals (Metacritic 85+) | LootScan",
        description:
          "Von der Kritik gefeierte PC-Spiele (Metacritic 85+) aktuell im Angebot. Preise in allen Stores vergleichen.",
        intro:
          "Die bestbewerteten PC-Spiele (Metacritic 85+) aktuell reduziert, nach Wertung sortiert.",
      },
    },
  },
  {
    slug: "epic-games-store-deals",
    filter: { storeID: "25", onSale: true, sortBy: "Savings", pageSize: 48 },
    copy: {
      en: {
        title: "Epic Games Store Deals — All Discounts | LootScan",
        description:
          "Every game currently discounted on the Epic Games Store, ranked by biggest savings. Updated hourly.",
        intro:
          "Live feed of every PC game currently discounted on the Epic Games Store.",
      },
      tr: {
        title: "Epic Games Store İndirimleri | LootScan",
        description:
          "Epic Games Store'da şu an indirimde olan tüm oyunlar, en büyük indirimden başlayarak. Saatlik güncellenir.",
        intro:
          "Epic Games Store'da indirimli tüm PC oyunlarının canlı listesi.",
      },
      de: {
        title: "Epic Games Store Angebote | LootScan",
        description:
          "Alle Spiele, die aktuell im Epic Games Store reduziert sind, sortiert nach größtem Rabatt.",
        intro:
          "Live-Feed aller PC-Spiele, die aktuell im Epic Games Store reduziert sind.",
      },
    },
  },
  {
    slug: "gog-deals",
    filter: { storeID: "7", onSale: true, sortBy: "Savings", pageSize: 48 },
    copy: {
      en: {
        title: "GOG Deals — DRM-Free Games on Sale | LootScan",
        description:
          "Every DRM-free game currently on sale at GOG, ranked by biggest discount. Updated hourly.",
        intro:
          "Live feed of every DRM-free PC game currently discounted on GOG.",
      },
      tr: {
        title: "GOG İndirimleri — DRM'siz Oyunlar | LootScan",
        description:
          "GOG'da şu an indirimde olan tüm DRM'siz oyunlar, en büyük indirimden başlayarak. Saatlik güncellenir.",
        intro:
          "GOG'da indirimli tüm DRM'siz PC oyunlarının canlı listesi.",
      },
      de: {
        title: "GOG-Angebote — DRM-freie Spiele | LootScan",
        description:
          "Alle DRM-freien Spiele, die aktuell bei GOG im Angebot sind, sortiert nach größtem Rabatt.",
        intro:
          "Live-Feed aller DRM-freien PC-Spiele, die aktuell bei GOG reduziert sind.",
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
