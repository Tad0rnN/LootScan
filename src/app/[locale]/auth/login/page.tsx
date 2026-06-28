"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Crosshair, Mail, Lock, Loader2, TrendingDown, Bell, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type Mode = "login" | "signup";

const BRAND_FEATURE_ICONS = [TrendingDown, Bell, ShieldCheck] as const;
const AMBIENT_STAT_VALUES = ["50k+", "67%", "30+"] as const;

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const t = useTranslations("auth");
  const locale = useLocale();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        window.location.href = `/${locale}/wishlist`;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/${locale}/auth/callback`,
        },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: t("checkEmail") });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — brand atmosphere */}
      <aside
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        aria-hidden="true"
      >
        {/* Ambient glow orbs */}
        <div
          className="glow-orb w-[500px] h-[500px] bg-brand-500/[0.13]"
          style={{ top: "-120px", left: "-120px" }}
        />
        <div
          className="glow-orb w-72 h-72 bg-brand-600/[0.10]"
          style={{ bottom: "10%", right: "5%" }}
        />
        <div
          className="glow-orb w-56 h-56 bg-emerald-300/[0.07]"
          style={{ top: "45%", left: "38%" }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 noise pointer-events-none" />

        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="relative z-10 inline-flex items-center gap-3 group w-fit"
        >
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform duration-200">
            <Crosshair className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-white">
            Loot<span className="text-brand-400">Scan</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-brand-400/80 text-[11px] font-semibold tracking-[0.18em] uppercase">
              {t("liveTracking")}
            </span>
          </div>

          <h2 className="text-[3.25rem] font-bold text-white leading-[1.1] tracking-tight mb-6">
            {t("heroTitle")}
            <br />
            <span className="text-brand-400">{t("heroHighlight")}</span>
          </h2>

          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            {t("heroDesc")}
          </p>

          {/* Stat tiles */}
          <div className="mt-12 grid grid-cols-3 gap-3">
            {([
              { value: AMBIENT_STAT_VALUES[0], labelKey: "statGames" },
              { value: AMBIENT_STAT_VALUES[1], labelKey: "statSavings" },
              { value: AMBIENT_STAT_VALUES[2], labelKey: "statStores" },
            ] as const).map(({ value, labelKey }) => (
              <div
                key={labelKey}
                className="relative overflow-hidden rounded-xl border border-white/[0.07] p-4"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
                }}
              >
                <div className="text-2xl font-bold text-white tabular-nums mb-0.5">{value}</div>
                <div className="text-slate-500 text-[11px] leading-tight">{t(labelKey)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature row */}
        <div className="relative z-10 flex items-center gap-6 border-t border-white/[0.06] pt-6">
          {([
            { Icon: BRAND_FEATURE_ICONS[0], labelKey: "featurePriceHistory" },
            { Icon: BRAND_FEATURE_ICONS[1], labelKey: "featureAlerts" },
            { Icon: BRAND_FEATURE_ICONS[2], labelKey: "featurePrivate" },
          ] as const).map(({ Icon, labelKey }) => (
            <div key={labelKey} className="flex items-center gap-2 text-slate-500 text-sm">
              <Icon className="w-4 h-4 text-brand-500/60" />
              <span>{t(labelKey)}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-white/[0.05] self-stretch" />

      {/* Right panel — form */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Crosshair className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">
              Loot<span className="text-brand-400">Scan</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[380px] animate-slide-up">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">
              {mode === "login" ? t("welcomeBack") : t("createAccount")}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === "login" ? t("signInDesc") : t("signUpDesc")}
            </p>
          </div>

          <div className="card p-6">
            {/* Mode toggle */}
            <div className="flex rounded-lg bg-black/40 border border-white/[0.05] p-1 mb-6">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setMessage(null);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    mode === m
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "login" ? t("signIn") : t("signUp")}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    className="input w-full pl-10"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  {t("password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input w-full pl-10"
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {message && (
                <div
                  role="alert"
                  className={`text-sm px-3 py-2.5 rounded-lg ${
                    message.type === "success"
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-1"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? t("signIn") : t("signUp")}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm mt-5">
            <Link href={`/${locale}`} className="hover:text-slate-300 transition-colors">
              {t("backToHome")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
