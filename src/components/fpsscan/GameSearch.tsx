"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, Check, X, Gamepad2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import type { FpsGameResult } from "@/types/fpsscan";

interface GameSearchProps {
  value: FpsGameResult | null;
  onSelect: (game: FpsGameResult | null) => void;
}

export default function GameSearch({ value, onSelect }: GameSearchProps) {
  const t = useTranslations("fpsscan");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FpsGameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    if (!val) { onSelect(null); setResults([]); setOpen(false); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/fpsscan/game-search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data.error || !data.results?.length) {
          const fallback: FpsGameResult = {
            id: -1,
            name: val,
            slug: val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            background_image: null,
            released: null,
            genres: [],
            platforms: [],
          };
          setResults([fallback]);
        } else {
          setResults(data.results);
        }
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function handleSelect(game: FpsGameResult) {
    setQuery(game.name);
    onSelect(game);
    setOpen(false);
    setFocused(false);
  }

  const displayValue = value && !open ? value.name : query;

  return (
    <div ref={wrapRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: focused ? "var(--brand-400, #4ade80)" : undefined }}
        />

        <input
          type="text"
          value={displayValue}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { setQuery(""); setOpen(!!results.length); setFocused(true); }}
          placeholder={t("gameSearchPlaceholder")}
          className="input w-full pl-11 pr-11"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
          ) : value && !open ? (
            <Check className="w-4 h-4 text-brand-400" />
          ) : null}
        </div>
      </div>

      {/* Selected game preview */}
      {value && !open && (
        <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/10">
          <div className="relative w-[72px] h-11 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
            {value.background_image ? (
              <SafeImage src={value.background_image} alt={value.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-slate-700" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{value.name}</p>
            <p className="text-xs text-slate-500 font-mono">
              {value.released?.slice(0, 4) ?? "?"} · {value.genres?.slice(0, 2).map((g) => g.name).join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { onSelect(null); setQuery(""); setResults([]); }}
            className="ml-auto flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div
          className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto rounded-xl shadow-2xl shadow-black/50"
          style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {results.map((game, i) => (
            <button
              key={game.id}
              type="button"
              onMouseDown={() => handleSelect(game)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-500/10 transition-colors"
              style={{
                borderBottom: i < results.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div className="flex-shrink-0 rounded-lg overflow-hidden bg-white/5" style={{ width: 64, height: 42 }}>
                {game.background_image ? (
                  <SafeImage src={game.background_image} alt={game.name} width={64} height={42} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-slate-700" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{game.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  {game.released?.slice(0, 4) ?? "?"}{" "}
                  {game.genres?.length ? `· ${game.genres.slice(0, 2).map((g) => g.name).join(", ")}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
