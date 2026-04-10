"use client";

import { useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import DealCard from "./DealCard";
import type { Deal } from "@/types";
import { useLocale, useTranslations } from "next-intl";

interface SearchState {
  interpretation: string;
  query: string;
  deals: Deal[];
}

export default function SearchInterface() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("search");
  const exampleQueries = [
    t("example1"),
    t("example2"),
    t("example3"),
    t("example4"),
    t("example5"),
    t("example6"),
  ];

  const search = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setInput(query);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, locale }),
      });

      if (!res.ok) {
        throw new Error(t("errorGeneric"));
      }

      const data: SearchState = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search box */}
      <div className="card p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="input w-full pl-10"
              placeholder={t("placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search(input)}
            />
          </div>
          <button
            onClick={() => search(input)}
            disabled={loading || !input.trim()}
            className="btn-primary flex items-center gap-2 px-5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {t("button")}
          </button>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2 mt-3">
          {exampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => search(q)}
              className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-colors border border-slate-700 hover:border-slate-600"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-3" />
          <p className="text-slate-400">{t("analyzing")}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-6 border-red-500/30 bg-red-500/5 text-red-400">
          <strong>{t("errorTitle")}:</strong> {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* AI interpretation */}
          <div className="card p-4 mb-6 bg-purple-500/5 border-purple-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-purple-300 font-medium">{t("aiInterpretation")}</p>
                <p className="text-slate-300 text-sm mt-1">{result.interpretation}</p>
              </div>
            </div>
          </div>

          {result.deals.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>{t("noDeals")}</p>
              <p className="text-sm mt-1">{t("noDealsDesc")}</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-sm mb-4">{t("dealsFound", { count: result.deals.length, query: result.query })}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.deals.map((deal) => (
                  <DealCard key={deal.dealID} deal={deal} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
