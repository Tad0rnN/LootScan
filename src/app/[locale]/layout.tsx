import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Space_Grotesk } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lootscan.co"),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  title: {
    default: "LootScan — Game Price Tracker",
    template: "%s | LootScan",
  },
  description:
    "Find the best PC game deals across Steam, Epic, GOG, and every major store. Free games, AAA discounts, and price tracking — updated hourly.",
  keywords: [
    "game deals",
    "cheap games",
    "free games",
    "steam sales",
    "epic games free",
    "game price tracker",
    "gog deals",
    "pc games on sale",
  ],
  openGraph: {
    type: "website",
    siteName: "LootScan",
    title: "LootScan — Game Price Tracker",
    description:
      "Find the best PC game deals across all major stores. Updated hourly.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LootScan — Game Price Tracker",
    description:
      "Find the best PC game deals across all major stores. Updated hourly.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070f",
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6204567480065033"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#07070f] text-slate-200 antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-[100px]" />
          </div>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
