"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === locale) ?? languages[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (code: string) => {
    setOpen(false);
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/") || "/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-sm"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <Globe className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left",
                lang.code === locale
                  ? "text-brand-400 bg-brand-500/10"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
              {lang.code === locale && <span className="ml-auto text-brand-500 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
