import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import PopularClient from "./PopularClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "popular" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/popular"),
    openGraph: { title: `${title} | LootScan`, description },
  };
}

export default function PopularPage() {
  return <PopularClient />;
}
