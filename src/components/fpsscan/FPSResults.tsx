"use client";

import { useTranslations } from "next-intl";
import clsx from "clsx";
import { AlertTriangle, Info } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import FPSMeter from "./FPSMeter";
import type { FPSResult, PCSpecs } from "@/types/fpsscan";

interface FPSResultsProps {
  result: FPSResult;
}

interface TierConfig {
  labelKey: "tierUltra" | "tierGreat" | "tierGood" | "tierPlayable" | "tierPoor";
  text: string;
  badgeBg: string;
  badgeText: string;
}

const tierConfig: Record<string, TierConfig> = {
  ultra: { labelKey: "tierUltra", text: "text-brand-400", badgeBg: "bg-brand-500/10 border-brand-500/25", badgeText: "text-brand-400" },
  great: { labelKey: "tierGreat", text: "text-green-400", badgeBg: "bg-green-500/10 border-green-500/25", badgeText: "text-green-400" },
  good: { labelKey: "tierGood", text: "text-yellow-400", badgeBg: "bg-yellow-500/10 border-yellow-500/25", badgeText: "text-yellow-400" },
  playable: { labelKey: "tierPlayable", text: "text-orange-400", badgeBg: "bg-orange-500/10 border-orange-500/25", badgeText: "text-orange-400" },
  poor: { labelKey: "tierPoor", text: "text-red-400", badgeBg: "bg-red-500/10 border-red-500/25", badgeText: "text-red-400" },
};

function getResolutionFPSColor(fps: number): string {
  if (fps >= 90) return "text-green-400";
  if (fps >= 60) return "text-yellow-400";
  if (fps >= 30) return "text-orange-400";
  return "text-red-400";
}

export default function FPSResults({ result }: FPSResultsProps) {
  const t = useTranslations("fpsscan");
  const { game, specs, fps, selectedFPS, performanceTier, fromCache, bottleneck, notes } = result;
  const tier = tierConfig[performanceTier];

  const allPresets: Array<PCSpecs["preset"]> = ["low", "medium", "high", "ultra"];
  const presetLabels: Record<PCSpecs["preset"], string> = {
    low: t("qualityLow"),
    medium: t("qualityMedium"),
    high: t("qualityHigh"),
    ultra: t("qualityUltra"),
  };

  const bottleneckMessage = bottleneck === "gpu" ? t("bottleneckGpu")
    : bottleneck === "cpu" ? t("bottleneckCpu")
    : bottleneck === "ram" ? t("bottleneckRam")
    : null;

  return (
    <div className="space-y-5">
      {/* Game hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900" style={{ minHeight: 140 }}>
        {game.background_image && (
          <div className="absolute inset-0">
            <SafeImage src={game.background_image} alt={game.name} fill className="object-cover opacity-[0.15] blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-slate-900/85" />
          </div>
        )}

        <div className="relative flex items-center gap-5 p-5 flex-wrap sm:flex-nowrap">
          {game.background_image && (
            <div className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-xl shadow-black/50" style={{ width: 90, height: 60 }}>
              <SafeImage src={game.background_image} alt={game.name} fill className="object-cover" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-white leading-tight truncate">{game.name}</h2>
            {game.genres?.length > 0 && (
              <p className="text-xs font-medium text-slate-400 mt-1">
                {game.genres.slice(0, 3).map((g) => g.name).join(" · ")}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div
                className={clsx(
                  "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border",
                  fromCache ? "bg-brand-500/10 border-brand-500/20 text-brand-400" : "bg-purple-500/10 border-purple-500/25 text-purple-400"
                )}
              >
                <span className={clsx("w-1.5 h-1.5 rounded-full", fromCache ? "bg-brand-400" : "bg-purple-400")} />
                {fromCache ? t("benchmarkDbBadge") : t("aiEstimateBadge")}
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {specs.resolution} · {specs.preset.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className={clsx("text-5xl font-black leading-none tabular-nums", tier.text)}>{selectedFPS}</div>
            <div className="text-xs font-bold text-slate-500 mt-1 tracking-wide">FPS</div>
            <div className={clsx("text-xs font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block border", tier.badgeBg, tier.badgeText)}>
              {t(tier.labelKey)}
            </div>
          </div>
        </div>
      </div>

      {/* Quality preset grid */}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">{t("qualityComparisonTitle")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allPresets.map((p) => (
            <FPSMeter key={p} fps={fps[specs.resolution][p]} label={presetLabels[p]} isSelected={p === specs.preset} />
          ))}
        </div>
      </div>

      {/* Resolution comparison */}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">{t("resolutionComparisonTitle")}</p>
        <div className="grid grid-cols-3 gap-3">
          {(["1080p", "1440p", "4K"] as const).map((res) => {
            const resFps = fps[res][specs.preset];
            const isActive = res === specs.resolution;
            return (
              <div
                key={res}
                className={clsx(
                  "rounded-xl p-4 text-center border transition-all",
                  isActive ? "bg-brand-500/5 border-brand-500/25" : "bg-white/[0.02] border-white/5"
                )}
              >
                <p className={clsx("text-xs font-bold uppercase tracking-wide mb-2", isActive ? "text-brand-400" : "text-slate-500")}>
                  {res}
                </p>
                <p className={clsx("text-3xl font-black tabular-nums leading-none", getResolutionFPSColor(resFps))}>{resFps}</p>
                <p className="text-xs text-slate-500 mt-1">FPS</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottleneck + Notes */}
      {(bottleneckMessage || notes) && (
        <div className="space-y-2">
          {bottleneckMessage && (
            <div className="flex gap-3 rounded-xl p-4 bg-yellow-500/[0.06] border border-yellow-500/15">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
              <p className="text-sm text-yellow-200/90">{bottleneckMessage}</p>
            </div>
          )}
          {notes && (
            <div className="flex gap-3 rounded-xl p-4 bg-purple-500/[0.06] border border-purple-500/15">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-400" />
              <p className="text-sm text-purple-200/90">{notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
