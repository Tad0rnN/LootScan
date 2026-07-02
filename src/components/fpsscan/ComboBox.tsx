"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

interface Option {
  id: string;
  name: string;
  label?: string;
}

interface ComboBoxProps {
  placeholder: string;
  options: Option[];
  value: Option | null;
  onSearch: (q: string) => void;
  onSelect: (option: Option) => void;
  loading?: boolean;
}

export default function ComboBox({ placeholder, options, value, onSearch, onSelect, loading }: ComboBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    onSearch(val);
    setOpen(true);
    if (!val) onSelect({ id: "", name: "" });
  }

  function handleSelect(opt: Option) {
    setQuery(opt.name);
    onSelect(opt);
    setOpen(false);
  }

  const displayValue = value?.name && !open ? value.name : query;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { setQuery(""); setOpen(true); }}
          placeholder={placeholder}
          className="input w-full pr-9"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
          </div>
        )}
        {value?.name && !open && !loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="w-3.5 h-3.5 text-brand-400" />
          </div>
        )}
      </div>

      {open && options.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1.5 max-h-64 overflow-y-auto rounded-xl shadow-2xl shadow-black/50"
          style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {options.map((opt, i) => (
            <button
              key={opt.id}
              type="button"
              onMouseDown={() => handleSelect(opt)}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-brand-500/10 hover:text-brand-400 transition-colors flex items-center justify-between gap-2"
              style={{
                borderBottom: i < options.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <span className="font-medium truncate">{opt.name}</span>
              {opt.label && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0 bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  {opt.label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
