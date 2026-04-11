import { getTranslations } from "next-intl/server";
import { Library } from "lucide-react";
import GameBrowseClient from "@/components/GameBrowseClient";

export default async function BrowsePage() {
  const t = await getTranslations("browse");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
          <Library className="w-3.5 h-3.5" />
          {t("badge")}
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{t("title")}</h1>
        <p className="text-slate-400 max-w-2xl">{t("subtitle")}</p>
      </div>

      <GameBrowseClient />
    </div>
  );
}
