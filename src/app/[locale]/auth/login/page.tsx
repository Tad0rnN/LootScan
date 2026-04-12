"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Crosshair, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type Mode = "login" | "signup";

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
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/${locale}/auth/callback` },
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
              <Crosshair className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">Loot<span className="text-brand-400">Scan</span></span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">{mode === "login" ? t("signInDesc") : t("signUpDesc")}</p>
        </div>

        <div className="card p-6">
          <div className="flex rounded-lg bg-slate-900 p-1 mb-6">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setMessage(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === m ? "bg-brand-500 text-white" : "text-slate-400 hover:text-white"}`}
              >
                {m === "login" ? t("signIn") : t("signUp")}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required className="input w-full pl-10" placeholder={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">{t("password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required minLength={6} className="input w-full pl-10" placeholder={t("passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            {message && (
              <div className={`text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? t("signIn") : t("signUp")}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          <Link href={`/${locale}`} className="hover:text-slate-300 transition-colors">{t("backToHome")}</Link>
        </p>
      </div>
    </div>
  );
}
