import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import DealsClient from "./DealsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deals" });
  const title = t("title");
  const description =
    "Browse thousands of PC game deals across Steam, Epic, GOG and 40+ stores. Filter by price, discount and rating — updated every few minutes.";
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/deals"),
    openGraph: { title: `${title} | LootScan`, description },
  };
}

export default function DealsPage() {
  return <DealsClient />;
}
