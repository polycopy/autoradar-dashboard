"use client";

type DemandSupplyRow = {
  vehicle: string;
  make: string;
  model: string;
  live: number;
  sold: number;
  total: number;
  sell_rate: number;
  avg_days: number | null;
  demand_score: number;
};

function getDemandLevel(row: DemandSupplyRow): {
  label: string;
  className: string;
  barColor: string;
} {
  if (row.sell_rate >= 60 && row.avg_days !== null && row.avg_days <= 20) {
    return {
      label: "Alta",
      className:
        "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
      barColor: "bg-accent",
    };
  }
  if (row.sell_rate >= 35 || (row.avg_days !== null && row.avg_days <= 40)) {
    return {
      label: "Media",
      className:
        "bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
      barColor: "bg-amber-500 dark:bg-amber-400",
    };
  }
  return {
    label: "Baja",
    className:
      "bg-zinc-500/15 text-zinc-500 dark:bg-zinc-400/15 dark:text-zinc-400",
    barColor: "bg-zinc-400 dark:bg-zinc-500",
  };
}

export function DemandSupplyChart({ data }: { data: DemandSupplyRow[] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle">
        <h3 className="text-sm font-semibold text-foreground">
          Demanda vs Oferta
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Modelos ordenados por velocidad de venta — verde = vendidos, gris =
          activos
        </p>
      </div>
      <div className="p-4 space-y-2">
        {data.map((row, i) => {
          const level = getDemandLevel(row);
          const sellPct = row.total > 0 ? (row.sold / row.total) * 100 : 0;

          return (
            <div
              key={row.vehicle}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-surface-2/50 transition-colors"
            >
              {/* Rank */}
              <span
                className="text-xs text-muted font-mono w-5 text-right shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {i + 1}
              </span>

              {/* Vehicle name */}
              <span className="text-sm font-medium text-foreground w-40 shrink-0 truncate">
                {row.vehicle}
              </span>

              {/* Bar */}
              <div className="flex-1 min-w-0">
                <div className="h-5 bg-surface-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${level.barColor} transition-all`}
                    style={{ width: `${Math.max(sellPct, 2)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Sell rate */}
                <span
                  className="text-xs font-mono font-medium text-foreground w-10 text-right"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {row.sell_rate}%
                </span>

                {/* Avg days */}
                <span
                  className="text-xs font-mono text-muted w-12 text-right"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {row.avg_days !== null ? `~${row.avg_days}d` : "—"}
                </span>

                {/* Counts */}
                <span
                  className="text-[10px] text-muted w-16 text-right"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {row.sold}/{row.total}
                </span>

                {/* Demand badge */}
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-14 text-center ${level.className}`}
                >
                  {level.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-border-subtle flex items-center gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
          Alta demanda
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 inline-block" />
          Media demanda
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500 inline-block" />
          Baja demanda
        </span>
        <span className="ml-auto">
          % = tasa de venta | d = dias promedio en venta
        </span>
      </div>
    </div>
  );
}
