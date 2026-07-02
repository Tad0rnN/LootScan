export interface GPU {
  id: string;
  name: string;
  brand: "nvidia" | "amd" | "intel";
  score: number; // RTX 3060 = 100 baseline
  vram: number; // GB
  tier: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface CPU {
  id: string;
  name: string;
  brand: "intel" | "amd";
  cpuScore: number; // i5-12400 = 100 baseline
}

export interface PCSpecs {
  gpu: GPU | null;
  cpu: CPU | null;
  ram: number; // GB
  resolution: "1080p" | "1440p" | "4K";
  preset: "low" | "medium" | "high" | "ultra";
}

export interface FpsGameResult {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  released: string | null;
  genres: { id: number; name: string }[];
  platforms: { platform: { name: string } }[];
}

export interface FPSEstimate {
  low: number;
  medium: number;
  high: number;
  ultra: number;
}

export interface ResolutionFPS {
  "1080p": FPSEstimate;
  "1440p": FPSEstimate;
  "4K": FPSEstimate;
}

export interface FPSResult {
  game: FpsGameResult;
  specs: PCSpecs;
  fps: ResolutionFPS;
  selectedFPS: number;
  performanceTier: "ultra" | "great" | "good" | "playable" | "poor";
  fromCache: boolean;
  bottleneck: "gpu" | "cpu" | "ram" | "none";
  notes: string;
}
