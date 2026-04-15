import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Crosshair } from "lucide-react";

export default async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-white/5 mt-20 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white tracking-tight">
              Loot<span className="text-brand-400">Scan</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500">
            <Link href={`/${locale}/about`} className="hover:text-slate-300 transition-colors">{t("about")}</Link>
            <Link href={`/${locale}/contact`} className="hover:text-slate-300 transition-colors">{t("contact")}</Link>
            <Link href={`/${locale}/privacy`} className="hover:text-slate-300 transition-colors">{t("privacy")}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-slate-300 transition-colors">{t("terms")}</Link>
          </nav>

          {/* Powered by */}
          <p className="text-slate-600 text-xs">
            {t("poweredBy")}{" "}
            <a href="https://www.cheapshark.com" className="hover:text-slate-400 transition-colors" target="_blank" rel="noreferrer">CheapShark</a>
            {" & "}
            <a href="https://ai.google.dev/" className="hover:text-slate-400 transition-colors" target="_blank" rel="noreferrer">Gemini AI</a>
            {" · "}© {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
