"use client";

import { LineChart, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/cheapshark";
import { analyzeDealInsights } from "@/lib/deal-insights";
import type { GameInfo } from "@/types";

interface Props {
  gameInfo: GameInfo;
}

function formatShortDate(locale: string, timestamp: number | null): string {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp * 1000));
}

function buildPath(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function GameDealInsights({ gameInfo }: Props) {
  const t = useTranslations("game");
  const locale = useLocale();
  const analysis = analyzeDealInsights(gameInfo);

  if (!analysis) return null;

  const values = analysis.points.map((point) => point.price);
  const width = 320;
  const height = 120;
  const path = buildPath(values, width, height);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const verdictTone =
    analysis.verdict === "buyNow"
      ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
      : analysis.verdict === "strongDeal"
        ? "text-lime-300 border-lime-500/30 bg-lime-500/10"
        : analysis.verdict === "fairPrice"
          ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
          : "text-rose-300 border-rose-500/30 bg-rose-500/10";

  const timingTone =
    analysis.timing === "buyNow"
      ? "text-emerald-300"
      : analysis.timing === "watch"
        ? "text-amber-300"
        : "text-rose-300";

  const timingIcon =
    analysis.timing === "buyNow"
      ? TrendingDown
      : analysis.timing === "watch"
        ? Sparkles
        : TrendingUp;

  const TimingIcon = timingIcon;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr] mb-6">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-brand-400" />
              {t("priceHistoryTitle")}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t("priceHistorySubtitle")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              {t("historicalLow")}
            </div>
            <div className="text-lg font-bold text-brand-300">
              {formatPrice(analysis.historicalLow)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <svg
            viewBox={`0 0 ${width} ${height + 12}`}
            className="w-full h-40"
            aria-label={t("priceHistoryTitle")}
          >
            <defs>
              <linearGradient id="price-history-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                y1={height * ratio}
                x2={width}
                y2={height * ratio}
                stroke="rgba(148, 163, 184, 0.14)"
                strokeDasharray="4 4"
              />
            ))}
            <path
              d={path}
              fill="none"
              stroke="url(#price-history-line)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {analysis.points.map((point, index) => {
              const x = (index / (analysis.points.length - 1 || 1)) * width;
              const y = height - ((point.price - min) / range) * height;
              return (
                <g key={point.label}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#0f172a"
                    stroke="#4ade80"
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={Math.max(12, y - 12)}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {formatPrice(point.price)}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {analysis.points.map((point) => (
              <div
                key={point.label}
                className="rounded-xl border border-slate-700/50 bg-slate-950/50 p-3"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-1">
                  {t(point.label)}
                </div>
                <div className="text-sm font-bold text-white">
                  {formatPrice(point.price)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {point.label === "current"
                    ? t("today")
                    : formatShortDate(locale, point.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="card p-6">
          <div className="text-sm font-medium text-slate-400 mb-2">
            {t("dealScoreTitle")}
          </div>
          <div className="flex items-end gap-3 mb-4">
            <div className="text-5xl font-black text-white leading-none">
              {analysis.score}
            </div>
            <div className="text-sm text-slate-500 mb-1">
              {t("outOf100")}
            </div>
          </div>
          <div className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${verdictTone}`}>
            {t(`dealVerdicts.${analysis.verdict}`)}
          </div>
          <p className="text-sm text-slate-300 mt-4">
            {analysis.percentAboveLow === 0
              ? t("dealScoreAtLow", { low: formatPrice(analysis.historicalLow) })
              : t("dealScoreAboveLow", {
                  percent: analysis.percentAboveLow,
                  low: formatPrice(analysis.historicalLow),
                })}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
              <div className="text-slate-500">{t("discountNow")}</div>
              <div className="text-white font-semibold">-{analysis.savingsPercent}%</div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
              <div className="text-slate-500">{t("storesTracked")}</div>
              <div className="text-white font-semibold">{analysis.uniqueStoreCount}</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-medium text-slate-400 mb-3">
            {t("bestTimeToBuyTitle")}
          </div>
          <div className={`flex items-center gap-2 font-semibold ${timingTone}`}>
            <TimingIcon className="w-4 h-4" />
            {t(`buyTiming.${analysis.timing}.title`)}
          </div>
          <p className="text-sm text-slate-300 mt-3">
            {t(`buyTiming.${analysis.timing}.description`, {
              low: formatPrice(analysis.historicalLow),
              percent: analysis.percentAboveLow,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
