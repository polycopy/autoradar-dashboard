import { Radar, Car, TrendingDown, Store } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import {
  OpportunitiesView,
  ScoredListing,
} from "@/components/opportunities-view";
import {
  getOpportunities,
  getMarketStats,
  getMarketMedians,
  getUniqueMakes,
  getUniqueCities,
} from "@/lib/queries";
import { discountToGrade } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const [raw, stats, medians, makes, cities] = await Promise.all([
    getOpportunities({ limit: 500 }),
    getMarketStats(),
    getMarketMedians(),
    getUniqueMakes(),
    getUniqueCities(),
  ]);

  const listings: ScoredListing[] = raw
    .map((listing) => {
      const key = `${listing.make_normalized}|${listing.model_normalized}`;
      const ref = medians.get(key);
      if (!ref || !listing.price_amount) {
        return {
          ...listing,
          discount_pct: 0,
          market_median: 0,
          grade: "D",
          margin_usd: 0,
        };
      }
      const price = Number(listing.price_amount);
      const discount = ((ref.median - price) / ref.median) * 100;
      const margin = ref.median - price - 400;
      const grade = discountToGrade(discount, margin);
      return {
        ...listing,
        discount_pct: Math.max(0, discount),
        market_median: ref.median,
        grade,
        margin_usd: margin,
      };
    })
    .sort((a, b) => b.discount_pct - a.discount_pct);

  const countByGrade = (g: string) =>
    listings.filter((l) => l.grade === g).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2
          className="text-xl sm:text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Oportunidades
        </h2>
        <p className="text-sm text-muted mt-1">
          Autos por debajo del precio de mercado en MercadoLibre y Facebook
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard
          label="Publicaciones"
          value={stats.live.toLocaleString()}
          icon={Car}
        />
        <StatCard
          label="Oportunidades"
          value={countByGrade("A") + countByGrade("B")}
          sub={`${countByGrade("A")} grado A · ${countByGrade("B")} grado B`}
          icon={Radar}
          accent
        />
        <StatCard
          label="Vendidos"
          value={stats.sold.toLocaleString()}
          icon={TrendingDown}
        />
        <StatCard
          label="Dealers"
          value={stats.dealers.toLocaleString()}
          icon={Store}
        />
      </div>

      <OpportunitiesView listings={listings} makes={makes} cities={cities} />
    </div>
  );
}
