import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
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
    icon: [{ url: "/icon.svg?v=3", type: "image/svg+xml", sizes: "any" }],
    shortcut: ["/icon.svg?v=3"],
    apple: [{ url: "/icon.svg?v=3" }],
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

  if (!routing.locales.includes(locale as "en" | "tr" | "de" | "nl" | "fr" | "it")) {
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
      <body className="min-h-screen flex flex-col bg-[#05050d] text-slate-200 antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            {/* Primary glow — top center */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
              style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            {/* Secondary — bottom right */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
              style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            {/* Tertiary — left mid */}
            <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full"
              style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.03) 0%, transparent 70%)', filter: 'blur(50px)' }} />
          </div>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
