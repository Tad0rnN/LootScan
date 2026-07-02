"use client";

import { useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import ComboBox from "./ComboBox";
import { GPUS, searchGPUs } from "@/data/fpsscan/gpus";
import { CPUS, searchCPUs } from "@/data/fpsscan/cpus";
import type { PCSpecs } from "@/types/fpsscan";

interface SpecsFormProps {
  value: PCSpecs;
  onChange: (specs: PCSpecs) => void;
}

export default function SpecsForm({ value, onChange }: SpecsFormProps) {
  const t = useTranslations("fpsscan");
  const [gpuOptions, setGpuOptions] = useState(GPUS.slice(0, 15));
  const [cpuOptions, setCpuOptions] = useState(CPUS.slice(0, 15));

  const resolutions: PCSpecs["resolution"][] = ["1080p", "1440p", "4K"];
  const presets: PCSpecs["preset"][] = ["low", "medium", "high", "ultra"];
  const presetLabels: Record<PCSpecs["preset"], string> = {
    low: t("qualityLow"),
    medium: t("qualityMedium"),
    high: t("qualityHigh"),
    ultra: t("qualityUltra"),
  };
  const ramOptions = [4, 8, 12, 16, 24, 32, 64];

  return (
    <div className="space-y-5">
      {/* GPU + CPU row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t("gpuLabel")}</label>
          <ComboBox
            placeholder={t("gpuPlaceholder")}
            options={gpuOptions.map((g) => ({ id: g.id, name: g.name, label: `${g.vram}GB` }))}
            value={value.gpu ? { id: value.gpu.id, name: value.gpu.name } : null}
            onSearch={(q) => setGpuOptions(q ? searchGPUs(q) : GPUS.slice(0, 15))}
            onSelect={(opt) => {
              const gpu = GPUS.find((g) => g.id === opt.id) ?? null;
              onChange({ ...value, gpu });
            }}
          />
          {value.gpu && (
            <p className="mt-1.5 text-xs text-slate-500 font-mono">
              {value.gpu.vram}GB VRAM · Tier {value.gpu.tier} · Score {value.gpu.score}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t("cpuLabel")}</label>
          <ComboBox
            placeholder={t("cpuPlaceholder")}
            options={cpuOptions.map((c) => ({ id: c.id, name: c.name }))}
            value={value.cpu ? { id: value.cpu.id, name: value.cpu.name } : null}
            onSearch={(q) => setCpuOptions(q ? searchCPUs(q) : CPUS.slice(0, 15))}
            onSelect={(opt) => {
              const cpu = CPUS.find((c) => c.id === opt.id) ?? null;
              onChange({ ...value, cpu });
            }}
          />
          {value.cpu && (
            <p className="mt-1.5 text-xs text-slate-500 font-mono">
              {value.cpu.brand.toUpperCase()} · Score {value.cpu.cpuScore}
            </p>
          )}
        </div>
      </div>

      {/* RAM + Resolution + Quality row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* RAM */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t("ramLabel")}</label>
          <select
            value={value.ram}
            onChange={(e) => onChange({ ...value, ram: Number(e.target.value) })}
            className="input w-full"
          >
            {ramOptions.map((r) => (
              <option key={r} value={r}>
                {r} GB
              </option>
            ))}
          </select>
        </div>

        {/* Resolution */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t("resolutionLabel")}</label>
          <div className="flex gap-1.5">
            {resolutions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ ...value, resolution: r })}
                className={clsx(
                  "flex-1 text-center text-xs font-semibold px-2 py-2.5 rounded-xl border transition-all",
                  value.resolution === r
                    ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                    : "bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Preset */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t("qualityLabel")}</label>
          <div className="flex gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ ...value, preset: p })}
                className={clsx(
                  "flex-1 text-center text-xs font-semibold px-2 py-2.5 rounded-xl border transition-all",
                  value.preset === p
                    ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                    : "bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10"
                )}
              >
                {presetLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
