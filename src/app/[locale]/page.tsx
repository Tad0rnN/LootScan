import Link from "next/link";
import { Zap, Search, Heart, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import HomeDeals from "@/components/HomeDeals";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Hero */}
      <section className="relative text-center pt-20 pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        </div>

        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          {t("badge")}
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-5 tracking-tight leading-[1.05]">
          {t("title")}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300">
            {t("titleHighlight")}
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/deals" className="btn-primary flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold">
            <Zap className="w-4 h-4" />
            {t("browseDeals")}
          </Link>
          <Link href="/search" className="btn-secondary flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold">
            <Search className="w-4 h-4" />
            {t("aiSearch")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-20">
        {([
          { icon: Zap,    titleKey: "feature1Title" as const, descKey: "feature1Desc" as const, color: "text-brand-400",  bg: "bg-brand-500/10"  },
          { icon: Search, titleKey: "feature2Title" as const, descKey: "feature2Desc" as const, color: "text-purple-400", bg: "bg-purple-500/10" },
          { icon: Heart,  titleKey: "feature3Title" as const, descKey: "feature3Desc" as const, color: "text-red-400",    bg: "bg-red-500/10"    },
        ]).map(({ icon: Icon, titleKey, descKey, color, bg }) => (
          <div key={titleKey} className="card p-5 flex gap-4 group hover:bg-white/[0.05] transition-all duration-200">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1.5 text-sm">{t(titleKey)}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t(descKey)}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Hot Deals + Free Games — client-side fetch */}
      <HomeDeals />
    </div>
  );
}
