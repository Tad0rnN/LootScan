import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Space_Grotesk } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LootScan — Game Price Tracker",
  description: "Find the best game deals across all major stores. Powered by AI search.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "tr" | "de" | "nl" | "zh" | "ja")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={spaceGrotesk.variable}>
      <body className="min-h-screen flex flex-col bg-[#07070f] text-slate-200 antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-[100px]" />
          </div>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 mt-20 py-8 text-center text-slate-600 text-sm">
            <p>
              LootScan © {new Date().getFullYear()} ·{" "}
              <a href="https://www.cheapshark.com" className="hover:text-slate-400 transition-colors" target="_blank" rel="noreferrer">CheapShark</a>
              {" & "}
              <a href="https://groq.com" className="hover:text-slate-400 transition-colors" target="_blank" rel="noreferrer">Groq AI</a>
            </p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
