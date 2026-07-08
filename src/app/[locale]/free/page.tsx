import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import FreeClient from "./FreeClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "free" });
  const title = `${t("title")} ${t("titleHighlight")}`.trim();
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/free"),
    openGraph: { title: `${title} | LootScan`, description },
  };
}

export default function FreePage() {
  return <FreeClient />;
}
