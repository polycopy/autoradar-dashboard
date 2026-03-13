"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { formatUSD } from "@/lib/utils";

type TrendPoint = { date: string; median: number; count: number };

export function PriceTrendChart({
  topModels,
}: {
  topModels: { make: string; model: string; count: number }[];
}) {
  const [selected, setSelected] = useState(
    topModels[0] ? `${topModels[0].make}|${topModels[0].model}` : "",
  );
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    const [make, model] = selected.split("|");
    setLoading(true);
    fetch(
      `/api/price-trend?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
    )
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selected]);

  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("es-UY", {
      day: "numeric",
      month: "short",
    }),
  }));

  const first = chartData[0]?.median ?? 0;
  const last = chartData[chartData.length - 1]?.median ?? 0;
  const change = last - first;
  const changePct = first > 0 ? (change / first) * 100 : 0;
  const weeks = chartData.length;

  return (
    <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Tendencia de Precios
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Evolución del precio mediano por semana
          </p>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-foreground text-sm focus:outline-none focus:border-accent/50"
        >
          {topModels.map((m) => (
            <option
              key={`${m.make}|${m.model}`}
              value={`${m.make}|${m.model}`}
            >
              {m.make} {m.model} ({m.count})
            </option>
          ))}
        </select>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-muted animate-spin" />
          </div>
        ) : chartData.length < 2 ? (
          <div className="flex items-center justify-center h-64 text-muted text-sm">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Datos insuficientes para este modelo</p>
              <p className="text-xs mt-1">
                Se necesitan al menos 2 semanas de datos
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="trendGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-subtle)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                axisLine={{ stroke: "var(--color-border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--color-foreground)",
                }}
                formatter={(value) => [
                  formatUSD(value as number),
                  "Mediana",
                ]}
                labelFormatter={(label) => `Semana: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="median"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#trendGradient)"
                dot={{ fill: "var(--color-accent)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "var(--color-accent)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {chartData.length >= 2 && !loading && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm">
            {change <= 0 ? (
              <TrendingDown className="w-4 h-4 text-accent" />
            ) : (
              <TrendingUp className="w-4 h-4 text-danger" />
            )}
            <span className={change <= 0 ? "text-accent" : "text-danger"}>
              {change <= 0 ? "" : "+"}
              {formatUSD(Math.abs(change))} ({change <= 0 ? "" : "+"}
              {changePct.toFixed(1)}%)
            </span>
            <span className="text-muted">
              en las últimas {weeks} semanas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
