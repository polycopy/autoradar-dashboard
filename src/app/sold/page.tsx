import { Clock, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import {
  getSoldListings,
  getSoldStats,
  getRotationByModel,
  getMarketMedians,
} from "@/lib/queries";
import { formatUSD, discountToGrade } from "@/lib/utils";
import { ListingCard } from "@/components/listing-card";

export const dynamic = "force-dynamic";

export default async function SoldPage() {
  const [soldListings, stats, rotation, medians] = await Promise.all([
    getSoldListings({ limit: 60 }),
    getSoldStats(),
    getRotationByModel(20),
    getMarketMedians(),
  ]);

  const scored = soldListings.map((listing) => {
    const key = `${listing.make_normalized}|${listing.model_normalized}`;
    const ref = medians.get(key);
    const price = Number(listing.price_amount ?? 0);
    const discount =
      ref ? Math.max(0, ((ref.median - price) / ref.median) * 100) : 0;
    const margin = ref ? ref.median - price - 400 : 0;
    const grade = ref ? discountToGrade(discount, margin) : "D";
    return { listing, discount, median: ref?.median ?? 0, grade };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Historial de Vendidos
        </h2>
        <p className="text-sm text-muted mt-1">
          Autos que desaparecieron del mercado — datos de rotación real
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard
          label="Total Vendidos"
          value={stats.total_sold.toLocaleString()}
          icon={TrendingDown}
        />
        <StatCard
          label="Días Promedio"
          value={`${stats.avg_days}d`}
          icon={Clock}
          accent
        />
        <StatCard
          label="Mediana Días"
          value={`${stats.median_days}d`}
          icon={BarChart3}
        />
        <StatCard
          label="Precio Promedio"
          value={formatUSD(stats.avg_price)}
          icon={DollarSign}
        />
      </div>

      {/* Rotation table */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-foreground">
            Rotación por Modelo
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Qué modelos se venden más rápido — ordenados por tasa de venta
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Total
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Vendidos
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Tasa Venta
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Días Prom.
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Precio Prom.
                </th>
              </tr>
            </thead>
            <tbody>
              {rotation.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted"
                  >
                    Sin datos de rotación todavía — se necesitan varios ciclos
                    de scraping
                  </td>
                </tr>
              ) : (
                rotation.map((row, i) => (
                  <tr
                    key={`${row.make}-${row.model}`}
                    className="border-b border-border-subtle/50 hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted font-mono w-5 text-right">
                          {i + 1}
                        </span>
                        <span>{row.vehicle}</span>
                      </div>
                    </td>
                    <td
                      className="text-right px-4 py-3 text-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.total}
                    </td>
                    <td
                      className="text-right px-4 py-3 text-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.sold}
                    </td>
                    <td className="text-right px-4 py-3">
                      <span
                        className={`font-mono font-medium ${
                          Number(row.sell_rate) >= 50
                            ? "text-accent"
                            : Number(row.sell_rate) >= 25
                              ? "text-warning"
                              : "text-muted"
                        }`}
                      >
                        {Number(row.sell_rate)}%
                      </span>
                    </td>
                    <td
                      className="text-right px-4 py-3 text-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.avg_days ? `${row.avg_days}d` : "—"}
                    </td>
                    <td
                      className="text-right px-6 py-3 text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.avg_price ? formatUSD(row.avg_price) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent sold */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Últimos vendidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {scored.map(({ listing, discount, median, grade }) => (
            <ListingCard
              key={listing.fb_listing_id}
              listing={listing}
              discount={discount}
              median={median}
              grade={grade}
              showSoldBadge
            />
          ))}
        </div>
      </div>
    </div>
  );
}
