import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/cheapshark";
import WishlistItemActions from "@/components/WishlistItemActions";
import { getTranslations } from "next-intl/server";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations("wishlist");

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: items } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-red-400 fill-current" />
        <div>
          <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
          <p className="text-slate-400 text-sm">{t("saved", { count: items?.length ?? 0 })}</p>
        </div>
      </div>

      {!items || items.length === 0 ? (
        <div className="card p-16 text-center">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t("empty")}</h2>
          <p className="text-slate-400 mb-6">{t("emptyDesc")}</p>
          <Link href={`/${locale}/deals`} className="btn-primary inline-flex">{t("browseDeals")}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const savings = parseFloat(item.normal_price) > 0
              ? Math.round((1 - parseFloat(item.current_price) / parseFloat(item.normal_price)) * 100)
              : 0;

            return (
              <div key={item.id} className="card p-4 flex items-center gap-4 hover:border-slate-600 transition-colors">
                <Link href={`/${locale}/game/${item.game_id}`} className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                  <Image src={item.game_thumb} alt={item.game_title} fill className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/${locale}/game/${item.game_id}`} className="font-semibold text-white hover:text-brand-400 transition-colors line-clamp-1">
                    {item.game_title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("added", { date: new Date(item.created_at).toLocaleDateString() })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-400 text-lg">{formatPrice(item.current_price)}</span>
                    {savings > 0 && <span className="badge-savings">-{savings}%</span>}
                  </div>
                  <span className="text-slate-500 text-sm line-through">{formatPrice(item.normal_price)}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/${locale}/game/${item.game_id}`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title={t("viewDeals")}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <WishlistItemActions itemId={item.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
