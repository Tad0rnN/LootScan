import { getTranslations } from "next-intl/server";
import { Crosshair, Zap, Bot, Heart } from "lucide-react";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/30">
          <Crosshair className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">{t("title")}</h1>
        <p className="text-slate-400 text-lg leading-relaxed">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 mb-12">
        {[
          { icon: Zap, title: t("feature1Title"), desc: t("feature1Desc") },
          { icon: Bot, title: t("feature2Title"), desc: t("feature2Desc") },
          { icon: Heart, title: t("feature3Title"), desc: t("feature3Desc") },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-8 text-center">
        <p className="text-slate-400 leading-relaxed">{t("missionText")}</p>
      </div>
    </div>
  );
}
