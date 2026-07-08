import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import GearClient from "./GearClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gear" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/gear"),
    openGraph: { title: `${title} | LootScan`, description },
  };
}

export default function GearPage() {
  return <GearClient />;
}
