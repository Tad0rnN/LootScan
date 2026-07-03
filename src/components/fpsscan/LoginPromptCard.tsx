"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LogIn } from "lucide-react";

export default function LoginPromptCard() {
  const t = useTranslations("fpsscan");
  const locale = useLocale();

  return (
    <section className="card p-6 border-brand-500/25 bg-brand-500/[0.03]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/10 border border-brand-500/30 text-brand-400">
          <LogIn className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{t("loginPromptTitle")}</h2>
          <p className="text-sm text-slate-400">{t("anonScanUsed")}</p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-5">{t("loginPromptDesc")}</p>

      <Link
        href={`/${locale}/auth/login`}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
      >
        <LogIn className="w-4 h-4" />
        {t("loginPromptButton")}
      </Link>
    </section>
  );
}
