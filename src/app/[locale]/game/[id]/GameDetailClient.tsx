"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Tag } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import RegionalSteamPrice from "@/components/RegionalSteamPrice";
import GameDealInsights from "@/components/GameDealInsights";
import { trackAffiliateClick } from "@/lib/analytics";
import { formatPrice, getStoreLogoUrl, getDealUrl } from "@/lib/cheapshark";
import { useTranslations, useLocale } from "next-intl";
import type { GameInfo, Store } from "@/types";
import SafeImage from "@/components/ui/SafeImage";
import StoreLogo from "@/components/ui/StoreLogo";

interface Props {
  id: string;
  gameInfo: GameInfo;
  stores: Store[];
}

export default function GameDetailClient({ id, gameInfo, stores }: Props) {
  const t = useTranslations("game");
  const locale = useLocale();
  const storeMap = Object.fromEntries(stores.map((s) => [s.storeID, s]));
  const backUrl = `/${locale}/deals`;

  const deals = [...(gameInfo.deals ?? [])].sort(
    (a, b) => parseFloat(a.price) - parseFloat(b.price)
  );

  if (deals.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          {gameInfo.info.title}
        </h1>
        <p className="text-slate-400 mb-6">
          No deals currently available for this game.
        </p>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToDeals")}
        </Link>
      </div>
    );
  }

  const cheapestDeal = deals[0];
  const savings = Math.round(parseFloat(cheapestDeal.savings));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={backUrl}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToDeals")}
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-full sm:w-64 h-40 sm:h-36 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
            <SafeImage
              src={gameInfo.info.thumb}
              alt={gameInfo.info.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              {gameInfo.info.title}
            </h1>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-brand-400">
                  {formatPrice(cheapestDeal.price)}
                </span>
                {savings > 0 && (
                  <>
                    <span className="text-slate-500 text-lg line-through">
                      {formatPrice(cheapestDeal.retailPrice)}
                    </span>
                    <span className="badge-savings text-sm px-2 py-1">
                      -{savings}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <RegionalSteamPrice appId={gameInfo.info.steamAppID} className="mb-4 text-slate-300" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <WishlistButton
                gameID={id}
                gameTitle={gameInfo.info.title}
                gameThumb={gameInfo.info.thumb}
                normalPrice={cheapestDeal.retailPrice}
                currentPrice={cheapestDeal.price}
              />
              <ShareButton
                url=""
                title={gameInfo.info.title}
                text={`${gameInfo.info.title} — ${formatPrice(cheapestDeal.price)}${savings > 0 ? ` (-${savings}%)` : ""} on LootScan`}
              />
            </div>
          </div>
        </div>
      </div>

      <GameDealInsights gameInfo={gameInfo} />

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-brand-400" />
        {t("currentPrices")}
      </h2>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 text-xs text-slate-400 uppercase tracking-wider">
                <th className="text-left px-2 sm:px-4 py-3">{t("store")}</th>
                <th className="text-right px-2 sm:px-4 py-3">{t("salePrice")}</th>
                <th className="text-right px-2 sm:px-4 py-3 hidden sm:table-cell">{t("regularPrice")}</th>
                <th className="text-right px-2 sm:px-4 py-3 hidden sm:table-cell">{t("savings")}</th>
                <th className="px-2 sm:px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {deals.map((deal) => {
                const store = storeMap[deal.storeID];
                const dealSavings = Math.round(parseFloat(deal.savings));
                const isCheapest = deal.dealID === cheapestDeal.dealID;
                return (
                  <tr
                    key={deal.dealID}
                    className={`hover:bg-slate-700/20 transition-colors ${isCheapest ? "bg-brand-500/5" : ""}`}
                  >
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StoreLogo
                          storeID={deal.storeID}
                          getStoreLogoUrl={getStoreLogoUrl}
                          alt={store?.storeName ?? "Store"}
                          width={20}
                          height={20}
                          className="object-contain"
                          unoptimized
                        />
                        <span className="text-sm text-slate-200">
                          {store?.storeName ?? `Store ${deal.storeID}`}
                        </span>
                        {isCheapest && (
                          <span className="badge-savings">{t("best")}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-bold text-brand-400">
                          {formatPrice(deal.price)}
                        </span>
                        {dealSavings > 0 && (
                          <span className="badge-savings sm:hidden">-{dealSavings}%</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-slate-400 text-sm">
                        {formatPrice(deal.retailPrice)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-right hidden sm:table-cell">
                      {dealSavings > 0 && (
                        <span className="badge-savings">-{dealSavings}%</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-right">
                      <a
                        href={getDealUrl(deal.dealID, deal.storeID, gameInfo.info.title, gameInfo.info.steamAppID)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() =>
                          trackAffiliateClick({
                            deal_id: deal.dealID,
                            game_id: id,
                            title: gameInfo.info.title,
                            store_id: deal.storeID,
                            destination_url: getDealUrl(deal.dealID, deal.storeID, gameInfo.info.title, gameInfo.info.steamAppID),
                            sale_price: deal.price,
                            placement: "game_detail",
                          })
                        }
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
