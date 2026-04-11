import { getTranslations } from "next-intl/server";
import { Mail, MessageSquare } from "lucide-react";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
          <Mail className="w-3.5 h-3.5" />
          {t("badge")}
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{t("title")}</h1>
        <p className="text-slate-400">{t("subtitle")}</p>
      </div>

      <div className="space-y-4 mb-10">
        <div className="card p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">{t("emailTitle")}</h3>
            <p className="text-slate-400 text-sm mb-2">{t("emailDesc")}</p>
            <a href="mailto:contact@lootscan.app" className="text-brand-400 hover:text-brand-300 transition-colors text-sm font-medium">
              contact@lootscan.app
            </a>
          </div>
        </div>

        <div className="card p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">{t("feedbackTitle")}</h3>
            <p className="text-slate-400 text-sm">{t("feedbackDesc")}</p>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <h2 className="text-lg font-semibold text-white mb-6">{t("formTitle")}</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">{t("formName")}</label>
            <input type="text" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50 text-sm" placeholder={t("formNamePlaceholder")} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">{t("formEmail")}</label>
            <input type="email" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50 text-sm" placeholder={t("formEmailPlaceholder")} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">{t("formMessage")}</label>
            <textarea rows={4} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50 text-sm resize-none" placeholder={t("formMessagePlaceholder")} />
          </div>
          <button type="submit" className="btn-primary w-full py-3">{t("formSubmit")}</button>
        </form>
      </div>
    </div>
  );
}
