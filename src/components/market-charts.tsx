"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d",
  "#10b981", "#059669", "#047857", "#065f46", "#064e3b",
  "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#ecfdf5",
];

export function MakeDistributionChart({
  data,
}: {
  data: { make: string; count: number }[];
}) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Top Marcas por Cantidad
      </h3>
      <p className="text-xs text-muted mb-4">
        Publicaciones activas por marca
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
            <XAxis
              type="number"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "#2a2d35" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="make"
              tick={{ fill: "#e0e0e0", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1d24",
                border: "1px solid #2a2d35",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e0e0e0" }}
              itemStyle={{ color: "#22c55e" }}
              formatter={(value) => [`${value} publicaciones`, ""]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const SEGMENT_LABELS: Record<string, string> = {
  budget: "Económico",
  mid: "Medio",
  premium: "Premium",
  luxury: "Lujo",
};

const SEGMENT_COLORS: Record<string, string> = {
  budget: "#22c55e",
  mid: "#f59e0b",
  premium: "#3b82f6",
  luxury: "#a855f7",
};

export function PriceSegmentChart({
  data,
}: {
  data: { segment: string; count: number; avg_price: number }[];
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: SEGMENT_LABELS[d.segment] ?? d.segment,
    color: SEGMENT_COLORS[d.segment] ?? "#6b7280",
  }));

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Distribución por Segmento de Precio
      </h3>
      <p className="text-xs text-muted mb-4">
        Cantidad de publicaciones por rango de precio
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "#e0e0e0", fontSize: 11 }}
              axisLine={{ stroke: "#2a2d35" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1d24",
                border: "1px solid #2a2d35",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e0e0e0" }}
              formatter={(value) => [`${value} autos`, "Cantidad"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {formatted.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
