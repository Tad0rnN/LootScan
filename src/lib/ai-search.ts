import type { AISearchResponse } from "@/types";
import { parseNaturalLanguageSearch as parseWithGemini } from "@/lib/gemini";

type GenrePreset = {
  label: string;
  keywords: string[];
  titles: string[];
};

type ReferencePreset = {
  keywords: string[];
  titles: string[];
};

const GENERIC_RECOMMENDATION_TITLES = [
  "The Witcher 3: Wild Hunt",
  "Red Dead Redemption 2",
  "Cyberpunk 2077",
  "Hades",
  "Hollow Knight",
  "Disco Elysium",
  "Divinity: Original Sin 2",
  "Resident Evil 2",
  "Stardew Valley",
  "Deep Rock Galactic",
  "Balatro",
  "Dave the Diver",
];

const GENRE_PRESETS: GenrePreset[] = [
  {
    label: "RPG",
    keywords: ["rpg", "role playing", "rol yapma", "jrpg", "crpg"],
    titles: ["The Witcher 3: Wild Hunt", "Divinity: Original Sin 2", "Disco Elysium", "Chained Echoes", "Persona 5 Royal", "Dragon's Dogma: Dark Arisen", "Fallout: New Vegas", "Tyranny", "Pillars of Eternity", "Sea of Stars", "Grim Dawn", "Undertale"],
  },
  {
    label: "soulslike",
    keywords: ["soulslike", "souls-like", "souls", "elden ring gibi", "dark souls gibi"],
    titles: ["Lies of P", "Remnant II", "Mortal Shell", "Blasphemous", "Code Vein", "The Surge 2", "Lords of the Fallen", "Death's Gambit: Afterlife", "Steelrising", "Salt and Sanctuary", "Thymesia", "Another Crab's Treasure"],
  },
  {
    label: "roguelike",
    keywords: ["roguelike", "roguelite", "rogue-like", "rogue-lite"],
    titles: ["Hades", "Dead Cells", "Slay the Spire", "Rogue Legacy 2", "Risk of Rain 2", "Enter the Gungeon", "The Binding of Isaac: Rebirth", "Cult of the Lamb", "Against the Storm", "Brotato", "Curse of the Dead Gods", "Wizard of Legend"],
  },
  {
    label: "strategy",
    keywords: ["strategy", "strateji", "tactics", "taktik", "4x", "grand strategy"],
    titles: ["Civilization VI", "Age of Empires II: Definitive Edition", "XCOM 2", "Into the Breach", "Crusader Kings III", "Europa Universalis IV", "Total War: WARHAMMER III", "Shadow Tactics: Blades of the Shogun", "Northgard", "Battle Brothers", "Against the Storm", "Desperados III"],
  },
  {
    label: "simulation",
    keywords: ["simulation", "simulator", "simulasyon", "simülasyon", "similasyon", "tycoon", "management"],
    titles: ["Euro Truck Simulator 2", "Microsoft Flight Simulator", "Two Point Hospital", "Two Point Campus", "Cities: Skylines", "Planet Zoo", "Planet Coaster", "Car Mechanic Simulator 2021", "PowerWash Simulator", "House Flipper", "Farming Simulator 22", "Kerbal Space Program"],
  },
  {
    label: "horror",
    keywords: ["horror", "korku", "survival horror"],
    titles: ["Resident Evil 2", "Alien: Isolation", "SOMA", "Signalis", "Amnesia: The Bunker", "The Evil Within 2", "Darkwood", "Dead Space", "Outlast", "Tormented Souls", "Little Nightmares II", "Visage"],
  },
  {
    label: "co-op",
    keywords: ["coop", "co-op", "co op", "cooperative", "multiplayer", "arkadaslarla", "arkadaşlarla"],
    titles: ["It Takes Two", "Deep Rock Galactic", "Helldivers 2", "Left 4 Dead 2", "Overcooked! 2", "Risk of Rain 2", "Valheim", "Terraria", "Sea of Thieves", "Lethal Company", "GTFO", "Warhammer: Vermintide 2"],
  },
  {
    label: "open world",
    keywords: ["open world", "acik dunya", "açık dünya", "sandbox"],
    titles: ["Red Dead Redemption 2", "Cyberpunk 2077", "Horizon Zero Dawn", "Days Gone", "Metal Gear Solid V: The Phantom Pain", "Sleeping Dogs: Definitive Edition", "No Man's Sky", "Kingdom Come: Deliverance", "Far Cry 5", "Just Cause 3", "Subnautica", "Mad Max"],
  },
  {
    label: "indie",
    keywords: ["indie", "bağımsız", "bagimsiz"],
    titles: ["Stardew Valley", "Hollow Knight", "Celeste", "Balatro", "Dave the Diver", "Katana ZERO", "A Short Hike", "Pizza Tower", "Loop Hero", "Vampire Survivors", "Cocoon", "Animal Well"],
  },
  {
    label: "shooter",
    keywords: ["shooter", "fps", "tps", "nisanci", "nişancı", "silah"],
    titles: ["DOOM Eternal", "Titanfall 2", "ULTRAKILL", "Severed Steel", "RoboCop: Rogue City", "Ready or Not", "Metro Exodus", "Dusk", "Trepang2", "Warhammer 40,000: Boltgun", "Deep Rock Galactic", "Insurgency: Sandstorm"],
  },
  {
    label: "survival",
    keywords: ["survival", "hayatta kalma", "hayatta", "zombi", "zombie"],
    titles: ["Valheim", "Project Zomboid", "V Rising", "Subnautica", "The Long Dark", "Green Hell", "Don't Starve Together", "State of Decay 2", "Raft", "Sons Of The Forest", "7 Days to Die", "Rust"],
  },
  {
    label: "story rich",
    keywords: ["story", "hikaye", "hikayeli", "narrative", "senaryo", "story rich"],
    titles: ["Disco Elysium", "Red Dead Redemption 2", "Detroit: Become Human", "Life is Strange", "A Plague Tale: Requiem", "What Remains of Edith Finch", "Firewatch", "Pentiment", "The Wolf Among Us", "Mass Effect Legendary Edition", "To the Moon", "Citizen Sleeper"],
  },
  {
    label: "racing",
    keywords: ["racing", "race", "yaris", "yarış", "araba", "driving"],
    titles: ["Forza Horizon 5", "Need for Speed Heat", "Assetto Corsa", "Wreckfest", "Dirt Rally 2.0", "F1 24", "Burnout Paradise Remastered", "Hot Wheels Unleashed 2", "CarX Drift Racing Online", "Sonic & All-Stars Racing Transformed", "Trackmania", "Automobilista 2"],
  },
];

const REFERENCE_PRESETS: ReferencePreset[] = [
  {
    keywords: ["cyberpunk", "cyberpunk 2077"],
    titles: [
      "Deus Ex: Human Revolution - Director's Cut",
      "Deus Ex: Mankind Divided",
      "Ghostrunner",
      "The Ascent",
      "Observer: System Redux",
      "Cloudpunk",
      "Remember Me",
      "Ruiner",
      "E.Y.E: Divine Cybermancy",
      "Shadowrun: Dragonfall - Director's Cut",
      "System Shock",
      "Akane",
    ],
  },
  {
    keywords: ["witcher", "witcher 3"],
    titles: [
      "Kingdom Come: Deliverance",
      "Dragon Age: Inquisition",
      "GreedFall",
      "The Elder Scrolls V: Skyrim Special Edition",
      "Divinity II: Developer's Cut",
      "Dragon's Dogma: Dark Arisen",
      "Risen 3 - Titan Lords",
      "Gothic 3",
      "Two Worlds II HD",
      "Middle-earth: Shadow of War",
      "Assassin's Creed Odyssey",
      "Outward Definitive Edition",
    ],
  },
  {
    keywords: ["elden ring", "dark souls", "souls"],
    titles: [
      "Lies of P",
      "Remnant II",
      "Mortal Shell",
      "Code Vein",
      "The Surge 2",
      "Lords of the Fallen",
      "Blasphemous",
      "Salt and Sanctuary",
      "Thymesia",
      "Death's Gambit: Afterlife",
      "Another Crab's Treasure",
      "Steelrising",
    ],
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseMaxPrice(query: string): number | undefined {
  const normalized = normalizeText(query);
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:\$|dolar|usd|euro|eur)?\s*(?:alti|altinda|altı|altında|altıdaki|and under|or less|less than|under|below|max|at most)/,
    /(?:under|below|max|less than|at most)\s*\$?\s*(\d+(?:[.,]\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(",", "."));
    }
  }

  return undefined;
}

function hasAdultAgeIntent(query: string): boolean {
  const raw = query.toLowerCase();
  return /(^|\s)(\+?18|18\+)(\s|$)/.test(raw)
    || raw.includes("adult")
    || raw.includes("mature")
    || raw.includes("yetiskin")
    || raw.includes("yetişkin");
}

function parseStoreId(query: string): string | undefined {
  const normalized = normalizeText(query);
  const storeMap: Record<string, string> = {
    steam: "1",
    gog: "7",
    epic: "27",
    humble: "11",
    fanatical: "15",
  };

  for (const [name, id] of Object.entries(storeMap)) {
    if (normalized.includes(name)) {
      return id;
    }
  }

  return undefined;
}

function isStoreDealsQuery(query: string): boolean {
  const normalized = normalizeText(query);
  const hasStore = Boolean(parseStoreId(query));
  const hasDealsIntent = [
    "deal",
    "deals",
    "discount",
    "discounted",
    "sale",
    "sales",
    "indirim",
    "indirimli",
    "firsat",
    "firsatlar",
    "fırsat",
    "fırsatlar",
    "ozel",
    "özel",
    "exclusive",
  ].some((keyword) => normalized.includes(normalizeText(keyword)));

  return hasStore && hasDealsIntent;
}

function parseOnSaleIntent(query: string): boolean {
  const normalized = normalizeText(query);
  return [
    "discount",
    "discounted",
    "sale",
    "on sale",
    "deal",
    "deals",
    "indirim",
    "indirimli",
    "firsat",
    "firsatlar",
    "fırsat",
    "fırsatlar",
    "ucuz",
    "cheap",
  ].some((keyword) => normalized.includes(normalizeText(keyword)));
}

function looksLikeBroadRecommendationQuery(query: string): boolean {
  const normalized = normalizeText(query);
  const recommendationWords = [
    "oyun",
    "oyunlar",
    "games",
    "game",
    "oner",
    "öner",
    "recommend",
    "tarzi",
    "tarzı",
    "benzeri",
    "like",
    "similar",
  ];

  const broadTokens = query
    .toLowerCase()
    .split(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/i)
    .filter(Boolean)
    .filter((token) => !["oyun", "oyunlar", "games", "game", "ve", "the", "best", "top"].includes(token));

  if (hasAdultAgeIntent(query)) return true;
  if (broadTokens.length <= 2 && recommendationWords.some((word) => normalized.includes(normalizeText(word)))) return true;
  if (normalized.includes("tarzi") || normalized.includes("tarzı") || normalized.includes("benzeri")) return true;

  return false;
}

function findGenrePreset(query: string): GenrePreset | null {
  if (hasAdultAgeIntent(query)) {
    return {
      label: "mature",
      keywords: [],
      titles: [
        "Cyberpunk 2077",
        "The Witcher 3: Wild Hunt",
        "Resident Evil 4",
        "Dead Space",
        "DOOM Eternal",
        "Mortal Kombat 11",
        "Manhunt",
        "The Callisto Protocol",
        "Outlast",
        "The Evil Within 2",
        "Postal 2",
        "Max Payne 3",
      ],
    };
  }

  const normalized = normalizeText(query);
  return GENRE_PRESETS.find((preset) =>
    preset.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  ) ?? null;
}

function parseReferenceStyleTitles(query: string): string[] | null {
  const normalized = normalizeText(query);
  const hasSimilarIntent = [
    "gibi",
    "benzeri",
    "tarzi",
    "tarzı",
    "like",
    "similar to",
  ].some((keyword) => normalized.includes(normalizeText(keyword)));

  if (!hasSimilarIntent) {
    return null;
  }

  const preset = REFERENCE_PRESETS.find((item) =>
    item.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  return preset?.titles ?? null;
}

function buildHeuristicInterpretation(query: string, locale: string | undefined, genreLabel?: string, maxPrice?: number): string {
  const hasBudget = typeof maxPrice === "number";

  switch (locale) {
    case "tr":
      if (genreLabel && hasBudget) return `${maxPrice} dolar altindaki ${genreLabel} oyun onerileri listeleniyor.`;
      if (genreLabel) return `${genreLabel} turunde oyun onerileri listeleniyor.`;
      if (hasBudget) return `${maxPrice} dolar altindaki oyun firsatlari listeleniyor.`;
      return `"${query}" icin oyun onerileri ve firsatlar listeleniyor.`;
    case "de":
      if (genreLabel && hasBudget) return `${genreLabel}-Empfehlungen unter ${maxPrice} Dollar werden angezeigt.`;
      if (genreLabel) return `${genreLabel}-Empfehlungen werden angezeigt.`;
      if (hasBudget) return `Spieleangebote unter ${maxPrice} Dollar werden angezeigt.`;
      return `Empfehlungen und Angebote für "${query}" werden angezeigt.`;
    case "nl":
      if (genreLabel && hasBudget) return `${genreLabel}-aanraders onder ${maxPrice} dollar worden getoond.`;
      if (genreLabel) return `${genreLabel}-aanraders worden getoond.`;
      if (hasBudget) return `Games onder ${maxPrice} dollar worden getoond.`;
      return `Aanraders en deals voor "${query}" worden getoond.`;
    case "fr":
      if (genreLabel && hasBudget) return `Affichage des recommandations ${genreLabel} à moins de ${maxPrice} dollars.`;
      if (genreLabel) return `Affichage des recommandations de jeux ${genreLabel}.`;
      if (hasBudget) return `Affichage des jeux à moins de ${maxPrice} dollars.`;
      return `Affichage des recommandations et des offres pour "${query}".`;
    case "it":
      if (genreLabel && hasBudget) return `Mostro consigli ${genreLabel} sotto i ${maxPrice} dollari.`;
      if (genreLabel) return `Mostro consigli di giochi ${genreLabel}.`;
      if (hasBudget) return `Mostro giochi sotto i ${maxPrice} dollari.`;
      return `Mostro consigli e offerte per "${query}".`;
    default:
      if (genreLabel && hasBudget) return `Showing ${genreLabel} recommendations under $${maxPrice}.`;
      if (genreLabel) return `Showing ${genreLabel} game recommendations.`;
      if (hasBudget) return `Showing games under $${maxPrice}.`;
      return `Showing recommendations and deals for "${query}".`;
  }
}

function buildHeuristicSearch(userQuery: string, locale?: string): AISearchResponse {
  const maxPrice = parseMaxPrice(userQuery);
  const storeID = parseStoreId(userQuery);
  const genrePreset = findGenrePreset(userQuery);
  const referenceTitles = parseReferenceStyleTitles(userQuery);
  const normalized = normalizeText(userQuery);
  const isFree = /\bfree\b|\bbedava\b|\bucretsiz\b|\bücretsiz\b/.test(normalized);
  const onSaleIntent = isFree || parseOnSaleIntent(userQuery);
  const storeDealsIntent = isStoreDealsQuery(userQuery);

  if (referenceTitles?.length) {
    return {
      interpretation: buildHeuristicInterpretation(userQuery, locale, undefined, isFree ? 0 : maxPrice),
      searchMode: "similar",
      gameTitles: referenceTitles,
      filters: {
        maxPrice: isFree ? 0 : maxPrice,
        storeID,
        sortBy: "Deal Rating",
        onSale: onSaleIntent,
      },
    };
  }

  if (genrePreset) {
    return {
      interpretation: buildHeuristicInterpretation(userQuery, locale, genrePreset.label, isFree ? 0 : maxPrice),
      searchMode: "similar",
      gameTitles: genrePreset.titles,
      filters: {
        maxPrice: isFree ? 0 : maxPrice,
        storeID,
        sortBy: "Deal Rating",
        onSale: onSaleIntent,
      },
    };
  }

  if (looksLikeBroadRecommendationQuery(userQuery)) {
    return {
      interpretation: buildHeuristicInterpretation(userQuery, locale, undefined, isFree ? 0 : maxPrice),
      searchMode: "similar",
      gameTitles: GENERIC_RECOMMENDATION_TITLES,
      filters: {
        maxPrice: isFree ? 0 : maxPrice,
        storeID,
        sortBy: "Deal Rating",
        onSale: onSaleIntent,
      },
    };
  }

  return {
    interpretation: buildHeuristicInterpretation(userQuery, locale, undefined, isFree ? 0 : maxPrice),
    searchMode: "deals",
    gameTitles: [],
    filters: {
      title: storeDealsIntent ? undefined : userQuery.trim(),
      maxPrice: isFree ? 0 : maxPrice,
      storeID,
      sortBy: "Deal Rating",
      onSale: onSaleIntent,
    },
  };
}

function mergeWithHeuristic(response: AISearchResponse, heuristic: AISearchResponse): AISearchResponse {
  const normalized = normalizeResponse(response);
  const hasGameTitles = normalized.gameTitles.length > 0;
  const titleLooksLikeGenre = normalized.filters.title ? Boolean(findGenrePreset(normalized.filters.title)) : false;
  const hasTitleFilter = Boolean(normalized.filters.title) && !titleLooksLikeGenre;

  if (!hasGameTitles && !hasTitleFilter && heuristic.searchMode === "similar") {
    return {
      ...heuristic,
      filters: {
        ...heuristic.filters,
        ...normalized.filters,
      },
      interpretation: normalized.interpretation || heuristic.interpretation,
    };
  }

  return {
    ...normalized,
    filters: {
      ...heuristic.filters,
      ...normalized.filters,
    },
  };
}

function normalizeResponse(response: AISearchResponse): AISearchResponse {
  return {
    interpretation: response.interpretation,
    searchMode: response.searchMode === "similar" ? "similar" : "deals",
    gameTitles: Array.isArray(response.gameTitles) ? response.gameTitles : [],
    filters: response.filters ?? {},
  };
}

export async function parseNaturalLanguageSearch(userQuery: string, locale?: string): Promise<AISearchResponse> {
  const heuristic = buildHeuristicSearch(userQuery, locale);

  try {
    return mergeWithHeuristic(await parseWithGemini(userQuery), heuristic);
  } catch (error) {
    console.warn(
      "AI search fallback is using heuristic parser:",
      error instanceof Error ? `Gemini: ${error.message}` : "Gemini: unknown error"
    );
  }
  return heuristic;
}
