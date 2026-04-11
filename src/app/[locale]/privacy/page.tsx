import { getTranslations } from "next-intl/server";
import { Shield } from "lucide-react";

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  const sections = [
    { title: t("s1Title"), content: t("s1Content") },
    { title: t("s2Title"), content: t("s2Content") },
    { title: t("s3Title"), content: t("s3Content") },
    { title: t("s4Title"), content: t("s4Content") },
    { title: t("s5Title"), content: t("s5Content") },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5" />
          {t("badge")}
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{t("title")}</h1>
        <p className="text-slate-500 text-sm">{t("lastUpdated")}</p>
      </div>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <div key={i} className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">{s.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
