"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Scale, Loader2, Car, ExternalLink } from "lucide-react";
import { formatUSD, formatKm, timeAgo, gradeColor, discountToGrade } from "@/lib/utils";
import { useCompare } from "@/lib/compare";
import type { Listing } from "@/lib/supabase";

type MedianMap = Record<string, { median: number; count: number }>;

type EnrichedListing = Listing & {
  median: number;
  discount: number;
  grade: string;
};

export default function ComparePage() {
  const searchParams = useSearchParams();
  const { selectedIds, clearCompare } = useCompare();

  const idsParam = searchParams.get("ids");
  const ids = useMemo(() => {
    if (idsParam) return idsParam.split(",").filter(Boolean);
    return selectedIds;
  }, [idsParam, selectedIds]);

  const [listings, setListings] = useState<Listing[]>([]);
  const [medians, setMedians] = useState<MedianMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/favorites?ids=${encodeURIComponent(ids.join(","))}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings ?? []);
        setMedians(data.medians ?? {});
      })
      .catch(() => {
        setListings([]);
        setMedians({});
      })
      .finally(() => setLoading(false));
  }, [ids]);

  // Enrich listings with median/discount/grade, preserve order from ids
  const enriched: EnrichedListing[] = useMemo(() => {
    const map = new Map<string, Listing>();
    for (const l of listings) map.set(l.fb_listing_id, l);

    return ids
      .map((id) => map.get(id))
      .filter((l): l is Listing => !!l)
      .map((l) => {
        const key = `${l.make_normalized}|${l.model_normalized}`;
        const ref = medians[key];
        const price = Number(l.price_amount ?? 0);
        const median = ref?.median ?? 0;
        const discount =
          ref && price > 0
            ? Math.max(0, ((ref.median - price) / ref.median) * 100)
            : 0;
        const margin = ref ? ref.median - price - 400 : 0;
        const grade = ref ? discountToGrade(discount, margin) : "D";
        return { ...l, median, discount, grade };
      });
  }, [listings, medians, ids]);

  // Helper: find the "best" index for a numeric row
  function bestIdx(
    values: (number | null)[],
    mode: "min" | "max",
  ): number | null {
    let best: number | null = null;
    let bestVal: number | null = null;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v == null || v === 0) continue;
      if (
        bestVal == null ||
        (mode === "min" && v < bestVal) ||
        (mode === "max" && v > bestVal)
      ) {
        best = i;
        bestVal = v;
      }
    }
    // Only highlight if there are at least 2 non-null values
    const nonNull = values.filter((v) => v != null && v !== 0).length;
    return nonNull >= 2 ? best : null;
  }

  // Row definitions
  type Row = {
    label: string;
    values: string[];
    best?: number | null;
    mono?: boolean;
  };

  const rows: Row[] = useMemo(() => {
    if (enriched.length === 0) return [];

    const prices = enriched.map((l) => Number(l.price_amount ?? 0));
    const medianVals = enriched.map((l) => l.median);
    const discounts = enriched.map((l) => l.discount);
    const years = enriched.map((l) => l.vehicle_year);
    const kms = enriched.map((l) => l.vehicle_odometer_value);

    return [
      {
        label: "Precio",
        values: enriched.map((l) =>
          l.price_amount ? formatUSD(Number(l.price_amount)) : "--",
        ),
        best: bestIdx(prices, "min"),
        mono: true,
      },
      {
        label: "Mediana mercado",
        values: enriched.map((l) =>
          l.median > 0 ? formatUSD(l.median) : "--",
        ),
        mono: true,
      },
      {
        label: "Descuento",
        values: enriched.map((l) =>
          l.discount > 0 ? `${Math.round(l.discount)}%` : "--",
        ),
        best: bestIdx(discounts, "max"),
      },
      {
        label: "Grado",
        values: enriched.map((l) => l.grade),
      },
      {
        label: "Ano",
        values: enriched.map((l) =>
          l.vehicle_year ? String(l.vehicle_year) : "--",
        ),
        best: bestIdx(years, "max"),
      },
      {
        label: "Kilometros",
        values: enriched.map((l) =>
          l.vehicle_odometer_value && l.vehicle_odometer_value > 0
            ? formatKm(l.vehicle_odometer_value)
            : "--",
        ),
        best: bestIdx(kms, "min"),
      },
      {
        label: "Combustible",
        values: enriched.map((l) => l.vehicle_fuel_type ?? "--"),
      },
      {
        label: "Transmision",
        values: enriched.map((l) => l.vehicle_transmission ?? "--"),
      },
      {
        label: "Color",
        values: enriched.map((l) => l.vehicle_exterior_color ?? "--"),
      },
      {
        label: "Ubicacion",
        values: enriched.map(
          (l) => l.location_city ?? l.location_display ?? "--",
        ),
      },
      {
        label: "Vendedor",
        values: enriched.map((l) =>
          l.is_dealer ? "Dealer" : l.seller_name ?? "Particular",
        ),
      },
      {
        label: "Fuente",
        values: enriched.map((l) => {
          const src =
            l.source ??
            (l.fb_listing_id.startsWith("ML-") ? "mercadolibre" : "facebook");
          return src === "mercadolibre" ? "MercadoLibre" : "Facebook";
        }),
      },
      {
        label: "Visto hace",
        values: enriched.map((l) => timeAgo(l.first_seen_at)),
      },
      {
        label: "Bajas de precio",
        values: enriched.map((l) =>
          l.price_drop_count > 0 ? `${l.price_drop_count}x` : "--",
        ),
        best: bestIdx(
          enriched.map((l) => l.price_drop_count),
          "max",
        ),
      },
    ];
  }, [enriched]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  if (ids.length === 0 || enriched.length === 0) {
    return (
      <div className="max-w-7xl space-y-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Comparador
          </h1>
          <p className="text-sm text-muted mt-1">
            Compara hasta 3 vehiculos lado a lado
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Sin vehiculos para comparar
          </h2>
          <p className="text-sm text-muted max-w-sm">
            Selecciona 2 o 3 vehiculos desde la grilla de oportunidades usando
            el icono de balanza, y despues toca &quot;Comparar&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Comparador
          </h1>
          <p className="text-sm text-muted mt-1">
            {enriched.length} vehiculo{enriched.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={clearCompare}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface-2 border border-border-subtle transition-colors"
        >
          Limpiar seleccion
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-8 lg:-mx-10 px-5 sm:px-8 lg:px-10">
        <table className="w-full border-collapse min-w-[600px]">
          {/* Header: thumbnails + titles */}
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-4 pr-4 w-36 align-bottom">
                <span className="text-xs uppercase tracking-wider text-muted font-medium">
                  Vehiculo
                </span>
              </th>
              {enriched.map((l) => {
                const hasImage =
                  l.primary_image_url &&
                  !l.primary_image_url.includes("null");
                const title =
                  l.make_normalized && l.model_normalized
                    ? `${l.make_normalized} ${l.model_normalized}`
                    : l.title;

                return (
                  <th
                    key={l.fb_listing_id}
                    className="text-left py-4 px-3 align-bottom"
                  >
                    <Link
                      href={`/listing/${encodeURIComponent(l.fb_listing_id)}`}
                      className="group block"
                    >
                      <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-surface-2 mb-3">
                        {hasImage ? (
                          <Image
                            src={l.primary_image_url!}
                            alt={l.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="250px"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted">
                            <Car className="w-8 h-8 opacity-20" />
                          </div>
                        )}
                        {l.grade !== "D" && (
                          <div className="absolute top-2 left-2">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider border ${gradeColor(l.grade)}`}
                            >
                              {l.grade}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                          {title}
                          {l.vehicle_year && (
                            <span className="text-muted ml-1">
                              {l.vehicle_year}
                            </span>
                          )}
                        </span>
                        <ExternalLink className="w-3 h-3 text-muted flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.label}
                className={`border-b border-border-subtle/50 ${
                  ri % 2 === 0 ? "bg-surface" : "bg-surface-2/30"
                }`}
              >
                <td className="py-3 pr-4 text-xs uppercase tracking-wider text-muted font-medium whitespace-nowrap">
                  {row.label}
                </td>
                {row.values.map((val, ci) => {
                  const isBest = row.best === ci;
                  const isGrade = row.label === "Grado";

                  return (
                    <td
                      key={ci}
                      className={`py-3 px-3 text-sm ${
                        row.mono
                          ? "font-bold"
                          : "font-medium"
                      } ${
                        isBest
                          ? "text-accent"
                          : isGrade
                            ? ""
                            : "text-foreground"
                      }`}
                      style={row.mono ? { fontFamily: "var(--font-mono)" } : undefined}
                    >
                      {isGrade ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider border ${gradeColor(val)}`}
                        >
                          {val}
                        </span>
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
