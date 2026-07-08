import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Search, Heart, Sparkles, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import HomeDeals from "@/components/HomeDeals";
import NewsletterSignup from "@/components/NewsletterSignup";
import JsonLd from "@/components/JsonLd";
import { buildAlternates, organizationSchema, websiteSchema } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: buildAlternates(locale, "") };
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <JsonLd data={[websiteSchema(locale), organizationSchema()]} />

      {/* ── Hero ── */}
      <section className="relative text-center pt-20 pb-16 overflow-hidden">

        {/* Ambient background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          {/* Main glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          {/* Side glows */}
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute top-0 right-1/4 w-[250px] h-[250px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

          {/* Top edge line */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.25) 50%, transparent 100%)' }} />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-brand-500/25 text-brand-400 text-[11px] font-bold px-4 py-2 rounded-full mb-9 uppercase tracking-[0.14em]"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.04) 100%)' }}>
          <Sparkles className="w-3 h-3" />
          {t("badge")}
        </div>

        {/* Heading */}
        <h1 className="text-[clamp(2.8rem,7vw,5rem)] font-bold text-white mb-5 tracking-[-0.03em] leading-[1.0]">
          {t("title")}<br />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #86efac 100%)' }}>
            {t("titleHighlight")}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
          <Link href={`/${locale}/deals`}
            className="btn-primary flex items-center gap-2 px-8 py-3.5 text-sm font-semibold group">
            <Zap className="w-4 h-4" />
            {t("browseDeals")}
            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </Link>
          <Link href={`/${locale}/search`}
            className="btn-secondary flex items-center gap-2 px-8 py-3.5 text-sm font-semibold">
            <Search className="w-4 h-4" />
            {t("aiSearch")}
          </Link>
        </div>

        {/* Stats strip */}
        <div className="inline-flex items-center gap-0 rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
          {[
            { value: "500K+", label: "Deals Tracked" },
            { value: "40+",   label: "Stores" },
            { value: "AI",    label: "Powered Search" },
          ].map(({ value, label }, i) => (
            <>
              {i > 0 && <div key={`div-${i}`} className="stat-divider" />}
              <div key={label} className="text-center px-7 py-4">
                <div className="text-lg font-bold text-white tracking-tight">{value}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            </>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {([
          {
            icon: Zap,
            titleKey: "feature1Title" as const,
            descKey:  "feature1Desc"  as const,
            accent: "#22c55e",
            accentRgb: "34,197,94",
            iconBg: "rgba(34,197,94,0.1)",
            gradient: "from-brand-500/[0.07] via-transparent",
          },
          {
            icon: Search,
            titleKey: "feature2Title" as const,
            descKey:  "feature2Desc"  as const,
            accent: "#a78bfa",
            accentRgb: "139,92,246",
            iconBg: "rgba(139,92,246,0.1)",
            gradient: "from-violet-500/[0.07] via-transparent",
          },
          {
            icon: Heart,
            titleKey: "feature3Title" as const,
            descKey:  "feature3Desc"  as const,
            accent: "#f87171",
            accentRgb: "239,68,68",
            iconBg: "rgba(239,68,68,0.1)",
            gradient: "from-red-500/[0.07] via-transparent",
          },
        ]).map(({ icon: Icon, titleKey, descKey, accent, accentRgb, iconBg }) => (
          <div key={titleKey} className="feature-card p-6 group">
            {/* Top accent glow line */}
            <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(90deg, transparent 0%, rgba(${accentRgb},0.6) 50%, transparent 100%)` }} />

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at top right, rgba(${accentRgb},0.07) 0%, transparent 70%)` }} />

            <div className="flex gap-4 items-start relative z-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 group-hover:scale-110"
                style={{
                  background: iconBg,
                  borderColor: `rgba(${accentRgb},0.2)`,
                  boxShadow: `0 0 0 0 rgba(${accentRgb},0)`,
                }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-2 text-sm leading-snug group-hover:text-white transition-colors">{t(titleKey)}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t(descKey)}</p>
              </div>
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
