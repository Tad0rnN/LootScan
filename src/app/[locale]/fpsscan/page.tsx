"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Crosshair, Loader2 } from "lucide-react";
import SpecsForm from "@/components/fpsscan/SpecsForm";
import GameSearch from "@/components/fpsscan/GameSearch";
import FPSResults from "@/components/fpsscan/FPSResults";
import type { PCSpecs, FpsGameResult, FPSResult, ResolutionFPS } from "@/types/fpsscan";
import { calculateFPS, getPerformanceTier } from "@/lib/fpsscan/fps-calculator";

const DEFAULT_SPECS: PCSpecs = {
  gpu: null,
  cpu: null,
  ram: 16,
  resolution: "1080p",
  preset: "high",
};

export default function FpsScanPage() {
  const t = useTranslations("fpsscan");
  const [specs, setSpecs] = useState<PCSpecs>(DEFAULT_SPECS);
  const [game, setGame] = useState<FpsGameResult | null>(null);
  const [result, setResult] = useState<FPSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    if (!specs.gpu || !game) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const local = calculateFPS(game.slug, game.name, specs);

    if (local) {
      const selectedFPS = local.fps[specs.resolution][specs.preset];
      setResult({
        game,
        specs,
        fps: local.fps,
        selectedFPS,
        performanceTier: getPerformanceTier(selectedFPS),
        fromCache: true,
        bottleneck: local.bottleneck,
        notes: "",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/fpsscan/fps-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specs, gameName: game.name, gameSlug: game.slug }),
      });

      if (!res.ok) throw new Error("estimate failed");
      const data = await res.json();

      const fps: ResolutionFPS = data.fps;
      const selectedFPS = fps[specs.resolution][specs.preset];

      setResult({
        game,
        specs,
        fps,
        selectedFPS,
        performanceTier: getPerformanceTier(selectedFPS),
        fromCache: false,
        bottleneck: data.bottleneck ?? "none",
        notes: data.notes ?? "",
      });
    } catch {
      setError(t("errorMessage"));
    } finally {
      setLoading(false);
    }
  }

  const canScan = !!specs.gpu && !!game;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
          <Crosshair className="w-7 h-7 text-brand-400" />
          {t("title")}
        </h1>
        <p className="text-slate-400 mt-1">{t("subtitle")}</p>
      </div>

      <div className="space-y-5">
        {/* Step 1: PC Specs */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-bold">
              1
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">{t("specsStep")}</h2>
          </div>
          <SpecsForm value={specs} onChange={setSpecs} />
        </section>

        {/* Step 2: Game Search */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold">
              2
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">{t("gameStep")}</h2>
          </div>
          <GameSearch value={game} onSelect={setGame} />
        </section>

        {/* Scan button */}
        <button
          onClick={handleScan}
          disabled={!canScan || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("scanning")}
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              {t("scanButton")}
            </>
          )}
        </button>

        {!specs.gpu && !loading && (
          <p className="text-center text-xs text-slate-500 -mt-2">{t("gpuRequiredHint")}</p>
        )}

        {error && (
          <div role="alert" className="rounded-xl p-4 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {result && (
          <section className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold">
                3
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">{t("resultStep")}</h2>
            </div>
            <FPSResults result={result} />
          </section>
        )}

        <p className="text-center text-xs text-slate-600 pb-4">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
