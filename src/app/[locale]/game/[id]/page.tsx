import { getGameInfo, getStores, formatPrice, getStoreLogoUrl } from "@/lib/cheapshark";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Tag, Trophy, Clock } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default async function GamePage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("game");

  let gameInfo;
  let stores;
  try {
    [gameInfo, stores] = await Promise.all([
      getGameInfo(id),
      getStores(),
    ]);
  } catch {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-lg">Game info could not be loaded. Please try again later.</p>
        <Link href="/deals" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("backToDeals")}
        </Link>
      </div>
    );
  }

  const storeMap = Object.fromEntries(stores.map((s) => [s.storeID, s]));

  if (!gameInfo.deals || gameInfo.deals.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">{gameInfo.info.title}</h1>
        <p className="text-slate-400">No deals currently available for this game.</p>
        <Link href="/deals" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("backToDeals")}
        </Link>
      </div>
    );
  }

  const cheapestDeal = gameInfo.deals.reduce((a, b) =>
    parseFloat(a.price) < parseFloat(b.price) ? a : b
  );

  const savings = Math.round(parseFloat(cheapestDeal.savings));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/deals" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t("backToDeals")}
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-full sm:w-64 h-40 sm:h-36 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
            <Image src={gameInfo.info.thumb} alt={gameInfo.info.title} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{gameInfo.info.title}</h1>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-brand-400">{formatPrice(cheapestDeal.price)}</span>
                {savings > 0 && (
                  <>
                    <span className="text-slate-500 text-lg line-through">{formatPrice(cheapestDeal.retailPrice)}</span>
                    <span className="badge-savings text-sm px-2 py-1">-{savings}%</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" />
                {t("cheapestEver")} <strong className="text-white ml-1">{formatPrice(gameInfo.cheapestPriceEver.price)}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {new Date(gameInfo.cheapestPriceEver.date * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-4">
              <WishlistButton
                gameID={id}
                gameTitle={gameInfo.info.title}
                gameThumb={gameInfo.info.thumb}
                normalPrice={cheapestDeal.retailPrice}
                currentPrice={cheapestDeal.price}
              />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-brand-400" />
        {t("currentPrices")}
      </h2>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 text-xs text-slate-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3">{t("store")}</th>
                <th className="text-right px-4 py-3">{t("salePrice")}</th>
                <th className="text-right px-4 py-3">{t("regularPrice")}</th>
                <th className="text-right px-4 py-3">{t("savings")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {gameInfo.deals
                .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                .map((deal) => {
                  const store = storeMap[deal.storeID];
                  const dealSavings = Math.round(parseFloat(deal.savings));
                  const isCheapest = deal.dealID === cheapestDeal.dealID;
                  return (
                    <tr key={deal.dealID} className={`hover:bg-slate-700/20 transition-colors ${isCheapest ? "bg-brand-500/5" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Image src={getStoreLogoUrl(deal.storeID)} alt={store?.storeName ?? "Store"} width={20} height={20} className="object-contain" />
                          <span className="text-sm text-slate-200">{store?.storeName ?? `Store ${deal.storeID}`}</span>
                          {isCheapest && <span className="badge-savings">{t("best")}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-brand-400">{formatPrice(deal.price)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-slate-400 text-sm">{formatPrice(deal.retailPrice)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {dealSavings > 0 && <span className="badge-savings">-{dealSavings}%</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs btn-primary py-1.5 px-3"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {t("getDeal")}
                        </a>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
