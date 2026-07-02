import type { PCSpecs, FPSEstimate, ResolutionFPS } from "@/types/fpsscan";
import { findBenchmark, findBenchmarkFuzzy } from "@/data/fpsscan/benchmarks";

const RESOLUTION_SCALE = { "1080p": 1.0, "1440p": 0.62, "4K": 0.34 };
const QUALITY_SCALE = { low: 1.4, medium: 1.18, high: 1.0, ultra: 0.77 };

function clamp(val: number, min: number, max: number) {
  return Math.round(Math.max(min, Math.min(max, val)));
}

function vramPenalty(vram: number, required: number): number {
  if (vram >= required) return 1.0;
  if (vram >= required * 0.75) return 0.7;
  return 0.45; // severe VRAM starvation
}

export function calculateFPS(
  gameSlug: string,
  gameName: string,
  specs: PCSpecs
): { fps: ResolutionFPS; fromCache: boolean; bottleneck: "gpu" | "cpu" | "ram" | "none" } | null {
  const bench = findBenchmark(gameSlug) || findBenchmarkFuzzy(gameName);
  if (!bench || !specs.gpu) return null;

  const { gpu, cpu, ram } = specs;
  const gpuScore = gpu.score;
  const cpuScore = cpu?.cpuScore ?? 100;

  // Determine bottleneck
  let bottleneck: "gpu" | "cpu" | "ram" | "none" = "none";
  const cpuContribution = bench.cpuWeight;
  const gpuContribution = 1 - bench.cpuWeight;
  const cpuNorm = cpuScore / 100;
  const gpuNorm = gpuScore / 100;

  if (cpuNorm < gpuNorm * 0.5 && cpuContribution > 0.2) {
    bottleneck = "cpu";
  } else if (ram < 8) {
    bottleneck = "ram";
  } else if (gpuNorm < 0.5) {
    bottleneck = "gpu";
  }

  // Effective performance score combining GPU + CPU weight
  const effectiveScore = gpuNorm * gpuContribution + cpuNorm * cpuContribution;

  // RAM penalty
  const ramMult = ram < 8 ? 0.6 : ram < 16 ? 0.88 : 1.0;

  function calcForResolution(res: "1080p" | "1440p" | "4K"): FPSEstimate {
    const resScale = RESOLUTION_SCALE[res];
    const vramMult = vramPenalty(gpu!.vram, bench!.vramThreshold[res]);

    const base = bench!.baseFps1080pHigh * effectiveScore * resScale * ramMult * vramMult;

    return {
      low: clamp(base * QUALITY_SCALE.low, 1, 999),
      medium: clamp(base * QUALITY_SCALE.medium, 1, 999),
      high: clamp(base, 1, 999),
      ultra: clamp(base * QUALITY_SCALE.ultra, 1, 999),
    };
  }

  return {
    fps: {
      "1080p": calcForResolution("1080p"),
      "1440p": calcForResolution("1440p"),
      "4K": calcForResolution("4K"),
    },
    fromCache: true,
    bottleneck,
  };
}

export function getPerformanceTier(fps: number): "ultra" | "great" | "good" | "playable" | "poor" {
  if (fps >= 144) return "ultra";
  if (fps >= 90) return "great";
  if (fps >= 60) return "good";
  if (fps >= 30) return "playable";
  return "poor";
}
