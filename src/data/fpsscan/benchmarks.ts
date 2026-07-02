// Base FPS at RTX 3060 (score=100) equivalent GPU, 1080p, High preset
// Sourced from Digital Foundry, TechPowerUp, GamersNexus benchmarks
export interface BenchmarkEntry {
  slug: string;
  name: string;
  baseFps1080pHigh: number; // RTX 3060 / RX 6600 equivalent
  cpuWeight: number; // 0=fully GPU-bound, 1=fully CPU-bound; most games ~0.15-0.3
  vramThreshold: { "1080p": number; "1440p": number; "4K": number }; // min VRAM for playable perf
}

export const BENCHMARKS: BenchmarkEntry[] = [
  // Esports / Competitive (very light GPU load)
  { slug: "counter-strike-2", name: "Counter-Strike 2", baseFps1080pHigh: 185, cpuWeight: 0.45, vramThreshold: { "1080p": 4, "1440p": 6, "4K": 8 } },
  { slug: "valorant", name: "Valorant", baseFps1080pHigh: 280, cpuWeight: 0.4, vramThreshold: { "1080p": 4, "1440p": 4, "4K": 6 } },
  { slug: "fortnite", name: "Fortnite", baseFps1080pHigh: 145, cpuWeight: 0.3, vramThreshold: { "1080p": 6, "1440p": 8, "4K": 10 } },
  { slug: "apex-legends", name: "Apex Legends", baseFps1080pHigh: 155, cpuWeight: 0.25, vramThreshold: { "1080p": 4, "1440p": 6, "4K": 8 } },
  { slug: "overwatch-2", name: "Overwatch 2", baseFps1080pHigh: 175, cpuWeight: 0.3, vramThreshold: { "1080p": 4, "1440p": 6, "4K": 8 } },
  { slug: "league-of-legends", name: "League of Legends", baseFps1080pHigh: 350, cpuWeight: 0.35, vramThreshold: { "1080p": 2, "1440p": 4, "4K": 4 } },
  { slug: "dota-2", name: "Dota 2", baseFps1080pHigh: 220, cpuWeight: 0.3, vramThreshold: { "1080p": 4, "1440p": 4, "4K": 6 } },
  // Open World / AAA
  { slug: "cyberpunk-2077", name: "Cyberpunk 2077", baseFps1080pHigh: 58, cpuWeight: 0.15, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 16 } },
  { slug: "red-dead-redemption-2", name: "Red Dead Redemption 2", baseFps1080pHigh: 72, cpuWeight: 0.2, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  { slug: "grand-theft-auto-v", name: "GTA V", baseFps1080pHigh: 125, cpuWeight: 0.3, vramThreshold: { "1080p": 4, "1440p": 6, "4K": 8 } },
  { slug: "witcher-3-wild-hunt", name: "The Witcher 3", baseFps1080pHigh: 95, cpuWeight: 0.2, vramThreshold: { "1080p": 6, "1440p": 8, "4K": 10 } },
  { slug: "elden-ring", name: "Elden Ring", baseFps1080pHigh: 88, cpuWeight: 0.15, vramThreshold: { "1080p": 8, "1440p": 8, "4K": 12 } },
  { slug: "baldurs-gate-3", name: "Baldur's Gate 3", baseFps1080pHigh: 78, cpuWeight: 0.2, vramThreshold: { "1080p": 8, "1440p": 8, "4K": 12 } },
  { slug: "the-last-of-us-part-i", name: "The Last of Us Part I", baseFps1080pHigh: 68, cpuWeight: 0.2, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  { slug: "hogwarts-legacy", name: "Hogwarts Legacy", baseFps1080pHigh: 65, cpuWeight: 0.2, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  { slug: "god-of-war", name: "God of War", baseFps1080pHigh: 92, cpuWeight: 0.18, vramThreshold: { "1080p": 6, "1440p": 8, "4K": 10 } },
  { slug: "spider-man-remastered", name: "Spider-Man Remastered", baseFps1080pHigh: 85, cpuWeight: 0.15, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  // Strategy / Simulation
  { slug: "microsoft-flight-simulator", name: "MS Flight Simulator", baseFps1080pHigh: 48, cpuWeight: 0.45, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 16 } },
  // Shooter
  { slug: "call-of-duty-warzone", name: "Call of Duty: Warzone", baseFps1080pHigh: 98, cpuWeight: 0.3, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  { slug: "battlefield-2042", name: "Battlefield 2042", baseFps1080pHigh: 78, cpuWeight: 0.3, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  { slug: "doom-eternal", name: "DOOM Eternal", baseFps1080pHigh: 185, cpuWeight: 0.15, vramThreshold: { "1080p": 6, "1440p": 8, "4K": 8 } },
  // Alan Wake 2 / Demanding
  { slug: "alan-wake-2", name: "Alan Wake 2", baseFps1080pHigh: 45, cpuWeight: 0.12, vramThreshold: { "1080p": 8, "1440p": 12, "4K": 16 } },
  // Minecraft
  { slug: "minecraft", name: "Minecraft", baseFps1080pHigh: 250, cpuWeight: 0.5, vramThreshold: { "1080p": 2, "1440p": 2, "4K": 4 } },
  // More titles
  { slug: "resident-evil-4", name: "Resident Evil 4 (2023)", baseFps1080pHigh: 105, cpuWeight: 0.15, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  { slug: "star-wars-jedi-survivor", name: "Star Wars Jedi: Survivor", baseFps1080pHigh: 62, cpuWeight: 0.25, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
  { slug: "diablo-iv", name: "Diablo IV", baseFps1080pHigh: 112, cpuWeight: 0.2, vramThreshold: { "1080p": 6, "1440p": 8, "4K": 10 } },
  { slug: "starfield", name: "Starfield", baseFps1080pHigh: 72, cpuWeight: 0.35, vramThreshold: { "1080p": 8, "1440p": 10, "4K": 12 } },
];

export function findBenchmark(slug: string): BenchmarkEntry | undefined {
  return BENCHMARKS.find((b) => b.slug === slug || slug.includes(b.slug) || b.slug.includes(slug));
}

export function findBenchmarkFuzzy(name: string): BenchmarkEntry | undefined {
  const n = name.toLowerCase();
  return BENCHMARKS.find(
    (b) => b.name.toLowerCase().includes(n) || n.includes(b.name.toLowerCase()) || b.slug.includes(n.replace(/\s/g, "-"))
  );
}
