import SearchInterface from "@/components/SearchInterface";
import { getTranslations } from "next-intl/server";

export default async function SearchPage() {
  const t = await getTranslations("search");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">{t("title")}</h1>
        <p className="text-slate-400 max-w-lg mx-auto">{t("subtitle")}</p>
      </div>
      <SearchInterface />
    </div>
  );
}
