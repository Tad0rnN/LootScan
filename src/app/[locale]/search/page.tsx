import SearchInterface from "@/components/SearchInterface";
import InteractiveShader from "@/components/ui/InteractiveShader";
import { getTranslations } from "next-intl/server";

export default async function SearchPage() {
  const t = await getTranslations("search");

  return (
    <div>
      {/* AI search hero — volumetric aurora backdrop */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none" aria-hidden="true">
          <InteractiveShader flowSpeed={0.2} colorIntensity={1.0} noiseLayers={3} mouseInfluence={0.25} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">{t("title")}</h1>
          <p className="text-slate-400 max-w-lg mx-auto">{t("subtitle")}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <SearchInterface />
      </div>
    </div>
  );
}
