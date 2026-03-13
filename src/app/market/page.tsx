import { TrendingUp, BarChart3, Clock, DollarSign } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import {
  getMarketStats,
  getTopRotation,
  getMakeDistribution,
  getPriceSegmentDistribution,
} from "@/lib/queries";
import { formatUSD } from "@/lib/utils";
import { MakeDistributionChart, PriceSegmentChart } from "@/components/market-charts";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const [stats, rotation, makesDist, segmentsDist] = await Promise.all([
    getMarketStats(),
    getTopRotation(30),
    getMakeDistribution(),
    getPriceSegmentDistribution(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Panorama del Mercado
        </h2>
        <p className="text-sm text-muted mt-1">
          Estadísticas y análisis de rotación de todos los listings monitoreados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Registrados"
          value={stats.total.toLocaleString()}
          icon={BarChart3}
        />
        <StatCard
          label="Activos Ahora"
          value={stats.live.toLocaleString()}
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Vendidos / Bajados"
          value={stats.sold.toLocaleString()}
          icon={Clock}
        />
        <StatCard
          label="De Dealers"
          value={stats.dealers.toLocaleString()}
          icon={DollarSign}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MakeDistributionChart data={makesDist} />
        <PriceSegmentChart data={segmentsDist} />
      </div>

      {/* Tabla de rotación */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h3 className="text-sm font-semibold text-foreground">
            Modelos con Mayor Rotación
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Ordenados por tasa de venta — los que se venden más rápido
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
                  Vistos
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
                    Sin datos de rotación todavía — se necesitan varios ciclos de scraping
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
                      {row.total_seen}
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
                          Number(row.sell_rate_pct) >= 50
                            ? "text-accent"
                            : Number(row.sell_rate_pct) >= 25
                              ? "text-warning"
                              : "text-muted"
                        }`}
                      >
                        {Number(row.sell_rate_pct).toFixed(0)}%
                      </span>
                    </td>
                    <td
                      className="text-right px-4 py-3 text-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.avg_days
                        ? `${Math.round(Number(row.avg_days))}d`
                        : "—"}
                    </td>
                    <td
                      className="text-right px-6 py-3 text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.avg_price
                        ? formatUSD(Number(row.avg_price))
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
