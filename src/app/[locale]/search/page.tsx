import SearchInterface from "@/components/SearchInterface";
import { getTranslations } from "next-intl/server";

export default async function SearchPage() {
  const t = await getTranslations("search");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          ✨ {t("badge")}
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{t("title")}</h1>
        <p className="text-slate-400 max-w-lg mx-auto">{t("subtitle")}</p>
      </div>
      <SearchInterface />
    </div>
  );
}
