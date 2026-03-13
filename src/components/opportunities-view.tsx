"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Radar, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import { ListingCard } from "./listing-card";
import type { Listing } from "@/lib/supabase";

export type ScoredListing = Listing & {
  discount_pct: number;
  market_median: number;
  grade: string;
  margin_usd: number;
};

export function OpportunitiesView({
  listings,
  makes,
  cities,
}: {
  listings: ScoredListing[];
  makes: string[];
  cities: string[];
}) {
  const router = useRouter();
  const [gradeFilter, setGradeFilter] = useState<"all" | "A" | "B" | "C">("all");
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setRefreshing(false);
      setLastRefresh(new Date());
    }, 1500);
  }, [router]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (gradeFilter !== "all" && l.grade !== gradeFilter) return false;
      if (gradeFilter === "all" && l.grade === "D") return false;
      if (selectedMakes.length > 0 && !selectedMakes.includes(l.make_normalized ?? ""))
        return false;
      if (priceMin && Number(l.price_amount) < Number(priceMin)) return false;
      if (priceMax && Number(l.price_amount) > Number(priceMax)) return false;
      if (selectedCity && l.location_city !== selectedCity) return false;
      return true;
    });
  }, [listings, gradeFilter, selectedMakes, priceMin, priceMax, selectedCity]);

  const countByGrade = (g: string) => listings.filter((l) => l.grade === g).length;

  const hasActiveFilters =
    selectedMakes.length > 0 || priceMin || priceMax || selectedCity;

  function clearFilters() {
    setSelectedMakes([]);
    setPriceMin("");
    setPriceMax("");
    setSelectedCity("");
  }

  function toggleMake(make: string) {
    setSelectedMakes((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make],
    );
  }

  return (
    <div className="space-y-4">
      {/* Grade tabs + filter toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "A", "B", "C"] as const).map((g) => {
          const count =
            g === "all"
              ? listings.filter((l) => l.grade !== "D").length
              : countByGrade(g);
          return (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                gradeFilter === g
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-surface text-muted border-border-subtle hover:border-border hover:text-foreground"
              }`}
            >
              {g === "all" ? "Todos" : `Grado ${g}`}
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            </button>
          );
        })}

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border bg-surface text-muted border-border-subtle hover:border-border hover:text-foreground transition-colors disabled:opacity-50"
          title={`Última actualización: ${lastRefresh.toLocaleTimeString("es-UY")}`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline text-xs">
            {lastRefresh.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-accent/10 text-accent border-accent/20"
              : "bg-surface text-muted border-border-subtle hover:border-border hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-surface border border-border-subtle rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Marcas */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted font-medium mb-2">
                Marcas
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {makes.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMake(m)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      selectedMakes.includes(m)
                        ? "bg-accent/10 text-accent border-accent/20"
                        : "bg-surface-2 text-muted border-border-subtle hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio min */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted font-medium mb-2">
                Precio mínimo (USD)
              </label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="1.500"
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:border-accent/50"
              />
            </div>

            {/* Precio max */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted font-medium mb-2">
                Precio máximo (USD)
              </label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="25.000"
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:border-accent/50"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted font-medium mb-2">
                Ubicación
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-foreground text-sm focus:outline-none focus:border-accent/50"
              >
                <option value="">Todas</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted">
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        {hasActiveFilters && " (filtrado)"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <Radar className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No se encontraron oportunidades</p>
          <p className="text-sm mt-1">
            {hasActiveFilters
              ? "Probá ajustando los filtros"
              : "El scanner corre cada 35 minutos — volvé a revisar pronto"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.fb_listing_id}
              listing={listing}
              discount={listing.discount_pct}
              median={listing.market_median}
              grade={listing.grade}
            />
          ))}
        </div>
      )}
    </div>
  );
}
