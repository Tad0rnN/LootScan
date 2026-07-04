import type { AISearchResponse } from "@/types";
import { parseNaturalLanguageSearch as parseWithNvidia } from "@/lib/nvidia";

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
  "Hades",
  "Hollow Knight",
  "Disco Elysium",
  "Divinity: Original Sin 2",
  "Resident Evil 2",
  "Stardew Valley",
  "Deep Rock Galactic",
  "Balatro",
  "Dave the Diver",
  "Outer Wilds",
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
  {
    label: "puzzle",
    keywords: ["puzzle", "bulmaca", "bölüm", "logic", "mantık", "brain"],
    titles: ["Portal 2", "The Witness", "Baba Is You", "The Talos Principle", "Return of the Obra Dinn", "Outer Wilds", "Antichamber", "The Room", "Opus Magnum", "Stephen's Sausage Roll", "Viewfinder", "Cocoon"],
  },
  {
    label: "platformer",
    keywords: ["platformer", "platform", "platform oyunu", "jump", "zıplama", "metroidvania"],
    titles: ["Hollow Knight", "Celeste", "Ori and the Blind Forest", "Ori and the Will of the Wisps", "Shovel Knight", "A Hat in Time", "Cuphead", "Rayman Legends", "Axiom Verge 2", "Blasphemous", "Aeterna Noctis", "Nine Sols"],
  },
  {
    label: "adventure",
    keywords: ["adventure", "macera", "macera oyunu", "exploration", "keşif", "point and click"],
    titles: ["Outer Wilds", "What Remains of Edith Finch", "A Short Hike", "Firewatch", "Subnautica", "Heaven's Vault", "Sable", "Journey", "Abzu", "Alba: A Wildlife Adventure", "Gris", "Spiritfarer"],
  },
  {
    label: "fighting",
    keywords: ["fighting", "dövüş", "dövüş oyunu", "fight", "beat em up", "arena", "versus"],
    titles: ["Mortal Kombat 11", "Street Fighter 6", "Tekken 7", "Dragon Ball FighterZ", "Guilty Gear Strive", "Brawlhalla", "Skullgirls 2nd Encore", "Rivals of Aether", "Them's Fightin' Herds", "King of Fighters XV", "BlazBlue: Cross Tag Battle", "Streets of Rage 4"],
  },
  {
    label: "stealth",
    keywords: ["stealth", "gizlilik", "gizli", "sneaky", "assassin", "spy"],
    titles: ["Hitman World of Assassination", "Dishonored 2", "Deus Ex: Mankind Divided", "Thief", "Shadow Tactics: Blades of the Shogun", "Desperados III", "Cyberpunk 2077", "Assassin's Creed Odyssey", "Mark of the Ninja: Remastered", "Aragami 2", "Invisible Inc.", "Splinter Cell: Blacklist"],
  },
  {
    label: "sports",
    keywords: ["sports", "spor", "football", "futbol", "soccer", "basketball", "tennis", "golf"],
    titles: ["Football Manager 2024", "Rocket League", "EA Sports FC 25", "NBA 2K24", "Tennis World Tour 2", "Golf With Your Friends", "PGA Tour 2K23", "Escape Academy", "Riders Republic", "Steep", "EA Sports WRC", "Super Mega Baseball 4"],
  },
  {
    label: "action",
    keywords: ["action", "aksiyon", "hack and slash", "beat em up", "katana", "sword"],
    titles: ["Hades", "Devil May Cry 5", "Sekiro: Shadows Die Twice", "Metal Gear Rising: Revengeance", "Bayonetta", "Ghostrunner", "Sifu", "Neon White", "Transistor", "Katana ZERO", "ULTRAKILL", "Hi-Fi Rush"],
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
      "Shadowrun: Dragonfall - Director's Cut",
      "System Shock",
      "VirtuaVerse",
      "Neon White",
    ],
  },
  {
    keywords: ["witcher", "witcher 3"],
    titles: [
      "Kingdom Come: Deliverance",
      "Dragon Age: Inquisition",
      "GreedFall",
      "The Elder Scrolls V: Skyrim Special Edition",
      "Dragon's Dogma: Dark Arisen",
      "Gothic 3",
      "Middle-earth: Shadow of War",
      "Assassin's Creed Odyssey",
      "Outward Definitive Edition",
      "Elex II",
      "Risen 3 - Titan Lords",
      "SpellForce 3: Reforced",
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
  {
    keywords: ["gta", "grand theft auto", "gta 5", "gta v"],
    titles: [
      "Saints Row IV: Re-Elected",
      "Sleeping Dogs: Definitive Edition",
      "Mafia: Definitive Edition",
      "Mafia II: Definitive Edition",
      "Mafia III: Definitive Edition",
      "Just Cause 4",
      "Watch Dogs 2",
      "Cyberpunk 2077",
      "True Crime: Streets of LA",
      "Yakuza 0",
      "Yakuza Kiwami",
      "Scarface: The World Is Yours",
    ],
  },
  {
    keywords: ["minecraft"],
    titles: [
      "Terraria",
      "Valheim",
      "Starbound",
      "Subnautica",
      "Raft",
      "Planet Crafter",
      "No Man's Sky",
      "Creativerse",
      "Eco",
      "7 Days to Die",
      "Empyrion - Galactic Survival",
      "The Planet Crafter",
    ],
  },
  {
    keywords: ["stardew", "stardew valley"],
    titles: [
      "Story of Seasons: Friends of Mineral Town",
      "Coral Island",
      "Sun Haven",
      "Littlewood",
      "Potion Permit",
      "Wylde Flowers",
      "Roots of Pacha",
      "Kynseed",
      "My Time at Portia",
      "My Time at Sandrock",
      "Ooblets",
      "Hokko Life",
    ],
  },
  {
    keywords: ["portal", "portal 2"],
    titles: [
      "The Talos Principle",
      "The Talos Principle 2",
      "Antichamber",
      "Manifold Garden",
      "The Witness",
      "Baba Is You",
      "Viewfinder",
      "Q.U.B.E. 2",
      "The Room VR",
      "Maquette",
      "Superliminal",
      "Splitgate",
    ],
  },
  {
    keywords: ["terraria"],
    titles: [
      "Starbound",
      "Core Keeper",
      "Forager",
      "Graveyard Keeper",
      "Hollow Knight",
      "Dead Cells",
      "Risk of Rain 2",
      "No Man's Sky",
      "Subnautica",
      "Valheim",
      "Raft",
      "Hades",
    ],
  },
  {
    keywords: ["red dead", "rdr2", "red dead redemption"],
    titles: [
      "Assassin's Creed Odyssey",
      "Far Cry 5",
      "Days Gone",
      "Kingdom Come: Deliverance",
      "Death Stranding: Director's Cut",
      "A Plague Tale: Requiem",
      "The Last of Us Part I",
      "Horizon Zero Dawn",
      "Sleeping Dogs: Definitive Edition",
      "Mad Max",
      "The Witcher 3: Wild Hunt",
      "Cyberpunk 2077",
    ],
  },
  {
    keywords: ["hades"],
    titles: [
      "Dead Cells",
      "Curse of the Dead Gods",
      "Rogue Legacy 2",
      "Children of Morta",
      "Returnal",
      "Neon Abyss",
      "Enter the Gungeon",
      "The Binding of Isaac: Rebirth",
      "Skul: The Hero Slayer",
      "Hades II",
      "Moonscars",
      "Slay the Spire",
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
    || raw.includes("yetişkin")
    || raw.includes("18 ve ustu")
    || raw.includes("18 ve üstü");
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

  // Check reference presets regardless of "similar" intent words —
  // "gta gibi", "minecraft oyunları", "stardew valley tarzı" all match
  const preset = REFERENCE_PRESETS.find((item) =>
    item.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  if (!preset) return null;

  // Only use reference preset if query contains a similarity/recommendation signal
  const hasSimilarIntent = [
    "gibi", "benzeri", "tarzi", "tarzı", "like", "similar to",
    "oyunlari", "oyunları", "alternative", "alternatif", "öneri", "oneri",
    "oyunlar", "games", "oyna",
  ].some((keyword) => normalized.includes(normalizeText(keyword)));

  // Also match bare reference queries like "minecraft" or "gta oyunları"
  const queryTokens = query.trim().split(/\s+/);
  const isShortQuery = queryTokens.length <= 3;

  if (hasSimilarIntent || isShortQuery) {
    return preset.titles;
  }

  return null;
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

function detectsFreeIntent(query: string): boolean {
  const normalized = normalizeText(query);
  return /\bfree\b|\bbedava\b|\bucretsiz\b/.test(normalized);
}

function buildFreeIntentInterpretation(locale: string | undefined): string {
  switch (locale) {
    case "tr": return "Su an ucretsiz olan oyunlar listeleniyor.";
    case "de": return "Aktuell kostenlose Spiele werden angezeigt.";
    case "nl": return "Momenteel gratis games worden getoond.";
    case "fr": return "Affichage des jeux actuellement gratuits.";
    case "it": return "Mostro i giochi attualmente gratuiti.";
    default: return "Showing games that are currently free.";
  }
}

function buildHeuristicSearch(userQuery: string, locale?: string): AISearchResponse {
  const maxPrice = parseMaxPrice(userQuery);
  const storeID = parseStoreId(userQuery);
  const genrePreset = findGenrePreset(userQuery);
  const referenceTitles = parseReferenceStyleTitles(userQuery);
  const isFree = detectsFreeIntent(userQuery);
  const onSaleIntent = isFree || parseOnSaleIntent(userQuery);
  const storeDealsIntent = isStoreDealsQuery(userQuery);

  // "Free" queries never match a curated title list — genre/reference presets and
  // GENERIC_RECOMMENDATION_TITLES are all paid AAA games, so combining them with a
  // maxPrice: 0 filter always filters every candidate out (they're never actually $0).
  // Route straight to "deals" mode instead, which already surfaces real free games via
  // CheapShark's upperPrice=0 deals plus the curated F2P fallback list.
  if (isFree) {
    return {
      interpretation: buildFreeIntentInterpretation(locale),
      searchMode: "deals",
      gameTitles: [],
      filters: {
        maxPrice: 0,
        storeID,
        sortBy: "Deal Rating",
        onSale: true,
      },
    };
  }

  if (referenceTitles?.length) {
    return {
      interpretation: buildHeuristicInterpretation(userQuery, locale, undefined, maxPrice),
      searchMode: "similar",
      gameTitles: referenceTitles,
      filters: {
        maxPrice,
        storeID,
        sortBy: "Deal Rating",
        onSale: onSaleIntent,
      },
    };
  }

  if (genrePreset) {
    return {
      interpretation: buildHeuristicInterpretation(userQuery, locale, genrePreset.label, maxPrice),
      searchMode: "similar",
      gameTitles: genrePreset.titles,
      filters: {
        maxPrice,
        storeID,
        sortBy: "Deal Rating",
        onSale: onSaleIntent,
      },
    };
  }

  if (looksLikeBroadRecommendationQuery(userQuery)) {
    return {
      interpretation: buildHeuristicInterpretation(userQuery, locale, undefined, maxPrice),
      searchMode: "similar",
      gameTitles: GENERIC_RECOMMENDATION_TITLES,
      filters: {
        maxPrice,
        storeID,
        sortBy: "Deal Rating",
        onSale: onSaleIntent,
      },
    };
  }

  return {
    interpretation: buildHeuristicInterpretation(userQuery, locale, undefined, maxPrice),
    searchMode: "deals",
    gameTitles: [],
    filters: {
      title: storeDealsIntent ? undefined : userQuery.trim(),
      maxPrice,
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

  // A "similar"-mode response with zero recommended titles is a broken response — the
  // model claimed it would return 20-25 titles (see nvidia.ts's system prompt) but gave
  // none, usually because it didn't recognize an unfamiliar/made-up term in the query.
  // Trust the heuristic's shape entirely rather than showing an empty results page.
  const aiClaimsSimilarButEmpty = normalized.searchMode === "similar" && !hasGameTitles;
  const shouldDeferToHeuristicShape =
    aiClaimsSimilarButEmpty || (!hasGameTitles && !hasTitleFilter && heuristic.searchMode === "similar");

  if (shouldDeferToHeuristicShape) {
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

// The model's default JSON-schema state is maxPrice: null, onSale: false — indistinguishable
// from "the model didn't think about it" — so whenever the query itself deterministically says
// "free", that intent must win regardless of what the model returned (see mergeWithHeuristic,
// which otherwise lets the model's filters silently overwrite the heuristic's).
function enforceFreeIntent(result: AISearchResponse, userQuery: string, locale?: string): AISearchResponse {
  if (!detectsFreeIntent(userQuery)) return result;

  return {
    ...result,
    searchMode: "deals",
    gameTitles: [],
    interpretation: buildFreeIntentInterpretation(locale),
    filters: {
      ...result.filters,
      maxPrice: 0,
      onSale: true,
    },
  };
}

export async function parseNaturalLanguageSearch(userQuery: string, locale?: string): Promise<AISearchResponse> {
  const heuristic = buildHeuristicSearch(userQuery, locale);

  try {
    const merged = mergeWithHeuristic(await parseWithNvidia(userQuery), heuristic);
    return enforceFreeIntent(merged, userQuery, locale);
  } catch (error) {
    console.warn(
      "AI search fallback is using heuristic parser:",
      error instanceof Error ? `NVIDIA: ${error.message}` : "NVIDIA: unknown error"
    );
  }
  return enforceFreeIntent(heuristic, userQuery, locale);
}
