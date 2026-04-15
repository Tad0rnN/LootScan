"use client";

import { useMemo, useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitState = "idle" | "success" | "error";

export default function NewsletterSignup() {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const emailError = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return null;
    if (trimmed.length > 320) return t("invalidEmail");
    if (!EMAIL_REGEX.test(trimmed)) return t("invalidEmail");
    return null;
  }, [email, t]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || emailError) {
      setState("error");
      setMessage(emailError ?? t("invalidEmail"));
      return;
    }

    setLoading(true);
    setState("idle");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          locale,
          signupPath: pathname,
          source: "homepage_inline",
          company: honeypot,
        }),
      });

      const data = (await response.json()) as { code?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? t("errorGeneric"));
      }

      if (data.code === "already_subscribed") {
        setState("success");
        setMessage(t("alreadySubscribed"));
      } else {
        setState("success");
        setMessage(t("success"));
      }
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative mb-20">
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/15 via-emerald-500/5 to-transparent blur-2xl" />
      <div className="card overflow-hidden border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-[#0d111c] to-[#090b12]">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.4fr,1fr] md:px-8 md:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
              <Mail className="h-3.5 w-3.5" />
              {t("eyebrow")}
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {t("subtitle")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                {t("benefit1")}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                {t("benefit2")}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                {t("benefit3")}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-400" htmlFor="newsletter-email">
                {t("inputLabel")}
              </label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("placeholder")}
                className="input w-full"
                maxLength={320}
                aria-invalid={Boolean(emailError)}
                disabled={loading}
              />
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {t("button")}
              </button>
            </form>

            {message && (
              <div
                className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
                  state === "success"
                    ? "border-brand-500/20 bg-brand-500/10 text-brand-200"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  {state === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                  <span>{message}</span>
                </div>
              </div>
            )}

            <p className="mt-3 text-xs leading-6 text-slate-500">
              {t("disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
