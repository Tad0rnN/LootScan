"use client";

import { useTranslations } from "next-intl";
import clsx from "clsx";

interface FPSMeterProps {
  fps: number;
  label: string;
  isSelected?: boolean;
}

interface TierStyle {
  text: string;
  bar: string;
  badgeBg: string;
  badgeText: string;
}

function getTierStyle(fps: number): TierStyle {
  if (fps >= 144) return { text: "text-brand-400", bar: "from-brand-400 to-brand-600", badgeBg: "bg-brand-500/10 border-brand-500/25", badgeText: "text-brand-400" };
  if (fps >= 90) return { text: "text-green-400", bar: "from-green-400 to-green-600", badgeBg: "bg-green-500/10 border-green-500/25", badgeText: "text-green-400" };
  if (fps >= 60) return { text: "text-yellow-400", bar: "from-yellow-400 to-orange-500", badgeBg: "bg-yellow-500/10 border-yellow-500/25", badgeText: "text-yellow-400" };
  if (fps >= 30) return { text: "text-orange-400", bar: "from-orange-400 to-red-500", badgeBg: "bg-orange-500/10 border-orange-500/25", badgeText: "text-orange-400" };
  return { text: "text-red-400", bar: "from-red-400 to-red-700", badgeBg: "bg-red-500/10 border-red-500/25", badgeText: "text-red-400" };
}

function getBarWidth(fps: number): number {
  return Math.min(100, (fps / 180) * 100);
}

export default function FPSMeter({ fps, label, isSelected }: FPSMeterProps) {
  const t = useTranslations("fpsscan");
  const tier = getTierStyle(fps);
  const barWidth = getBarWidth(fps);
  const tierLabel = fps >= 144 ? t("tierUltra") : fps >= 90 ? t("tierGreat") : fps >= 60 ? t("tierGood") : fps >= 30 ? t("tierPlayable") : t("tierPoor");

  return (
    <div
      className={clsx(
        "rounded-xl p-4 transition-all duration-200 border",
        isSelected ? "bg-brand-500/5 border-brand-500/25" : "bg-white/[0.02] border-white/5"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-md border", tier.badgeBg, tier.badgeText)}>
          {tierLabel}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className={clsx("text-3xl font-black tabular-nums leading-none", tier.text)}>{fps}</span>
        <span className="text-sm font-semibold text-slate-500">FPS</span>
      </div>

      <div className="h-1 rounded-full overflow-hidden bg-white/5">
        <div className={clsx("h-full rounded-full bg-gradient-to-r transition-all", tier.bar)} style={{ width: `${barWidth}%` }} />
      </div>
    </div>
  );
}
