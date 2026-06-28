import Link from "next/link";
import { Zap, Search, Heart, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import HomeDeals from "@/components/HomeDeals";
import NewsletterSignup from "@/components/NewsletterSignup";

export default async function HomePage() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Hero ── */}
      <section className="relative text-center pt-24 pb-28 overflow-hidden">

        {/* Ambient background orbs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="glow-orb w-[600px] h-[400px] bg-brand-500/[0.07] -top-20 left-1/2 -translate-x-1/2" />
          <div className="glow-orb w-[300px] h-[300px] bg-purple-600/[0.05] top-10 left-1/4" />
          <div className="glow-orb w-[250px] h-[250px] bg-brand-400/[0.06] top-0 right-1/4" />

          {/* Top line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-brand-500/20 text-brand-400/90 text-[11px] font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-[0.12em]"
          style={{ background: 'rgba(34,197,94,0.06)' }}>
          <Sparkles className="w-3 h-3" />
          {t("badge")}
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-5 tracking-[-0.03em] leading-[1.02]">
          {t("title")}<br />
          <span className="relative">
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #4ade80 0%, #22c55e 40%, #86efac 100%)' }}>
              {t("titleHighlight")}
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href={`/${locale}/deals`}
            className="btn-primary flex items-center gap-2 px-7 py-3.5 text-sm font-semibold group">
            <Zap className="w-4 h-4" />
            {t("browseDeals")}
            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </Link>
          <Link href={`/${locale}/search`}
            className="btn-secondary flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">
            <Search className="w-4 h-4" />
            {t("aiSearch")}
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-14 flex items-center justify-center gap-8 sm:gap-12">
          {[
            { value: "500K+", label: "deals tracked" },
            { value: "40+",   label: "stores" },
            { value: "AI",    label: "powered search" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold text-white tracking-tight">{value}</div>
              <div className="text-[11px] text-slate-600 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-20">
        {([
          {
            icon: Zap,
            titleKey: "feature1Title" as const,
            descKey:  "feature1Desc"  as const,
            accent: "#22c55e",
            iconBg: "rgba(34,197,94,0.1)",
          },
          {
            icon: Search,
            titleKey: "feature2Title" as const,
            descKey:  "feature2Desc"  as const,
            accent: "#a78bfa",
            iconBg: "rgba(139,92,246,0.1)",
          },
          {
            icon: Heart,
            titleKey: "feature3Title" as const,
            descKey:  "feature3Desc"  as const,
            accent: "#f87171",
            iconBg: "rgba(239,68,68,0.1)",
          },
        ]).map(({ icon: Icon, titleKey, descKey, accent, iconBg }) => (
          <div key={titleKey}
            className="card card-hover p-5 flex gap-4 group relative overflow-hidden">
            {/* Subtle accent line top */}
            <div className="absolute top-0 left-5 right-5 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />

            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: iconBg }}>
              <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1.5 text-sm">{t(titleKey)}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t(descKey)}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Deals ── */}
      <HomeDeals />

      {/* ── Newsletter ── */}
      <NewsletterSignup />
    </div>
  );
}
