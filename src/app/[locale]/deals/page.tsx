import { getDeals, getStores, deduplicateDeals } from "@/lib/cheapshark";
import DealCard from "@/components/DealCard";
import DealsFilters from "@/components/DealsFilters";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

interface Props {
  searchParams: Promise<{
    storeID?: string;
    sortBy?: string;
    upperPrice?: string;
    lowerPrice?: string;
    metacritic?: string;
    title?: string;
    onSale?: string;
    page?: string;
  }>;
}

export default async function DealsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("deals");
  const page = parseInt(params.page ?? "0");

  // Belirli bir mağaza seçilmişse dedup gerekmez, yoksa fazla çek dedup yap
  const hasStoreFilter = !!params.storeID;
  const fetchSize = hasStoreFilter ? 24 : 60;

  const [rawDeals, stores] = await Promise.all([
    getDeals({
      storeID: params.storeID,
      sortBy: params.sortBy,
      upperPrice: params.upperPrice !== undefined ? parseFloat(params.upperPrice) : undefined,
      lowerPrice: params.lowerPrice !== undefined ? parseFloat(params.lowerPrice) : undefined,
      metacritic: params.metacritic ? parseInt(params.metacritic) : undefined,
      title: params.title,
      onSale: params.onSale === "1",
      pageNumber: page,
      pageSize: fetchSize,
    }),
    getStores(),
  ]);

  const deals = hasStoreFilter ? rawDeals : deduplicateDeals(rawDeals).slice(0, 24);
  const activeStores = stores.filter((s) => s.isActive === 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">{t("found", { count: deals.length })}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 flex-shrink-0">
          <DealsFilters stores={activeStores} currentParams={params} />
        </aside>

        <div className="flex-1">
          {deals.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <p className="text-lg">{t("noDeals")}</p>
              <p className="text-sm mt-2">{t("tryAdjusting")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {deals.map((deal) => (
                  <DealCard key={deal.dealID} deal={deal} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-8">
                {page > 0 && (
                  <a href={`/deals?${new URLSearchParams({ ...params, page: String(page - 1) })}`} className="btn-secondary">
                    {t("previous")}
                  </a>
                )}
                <span className="text-slate-400 text-sm">{t("page", { page: page + 1 })}</span>
                {deals.length === 24 && (
                  <a href={`/deals?${new URLSearchParams({ ...params, page: String(page + 1) })}`} className="btn-secondary">
                    {t("next")}
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
