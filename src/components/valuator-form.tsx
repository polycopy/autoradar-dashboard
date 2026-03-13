"use client";

import { useState, useEffect } from "react";
import { Calculator, Search, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatUSD } from "@/lib/utils";

type ValuationResult = {
  estimated_price: number;
  sample_size: number;
  min_price: number;
  max_price: number;
  p25: number;
  p75: number;
};

export function ValuatorForm({ makes }: { makes: string[] }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [distribution, setDistribution] = useState<
    { price: number; count: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!make) {
      setModels([]);
      setModel("");
      return;
    }
    setLoadingModels(true);
    setModel("");
    fetch(`/api/models?make=${encodeURIComponent(make)}`)
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [make]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!make || !model) {
      setError("Marca y modelo son obligatorios");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setDistribution([]);

    try {
      const params = new URLSearchParams({ make, model });
      if (year) params.set("year", year);

      const res = await fetch(`/api/valuate?${params}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(
          data.error || "No hay suficientes datos. Probá con otra marca/modelo.",
        );
        return;
      }

      setResult(data.valuation);
      setDistribution(data.distribution ?? []);
    } catch {
      setError("Error al consultar la valuación");
    } finally {
      setLoading(false);
    }
  }

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <>
      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border-subtle rounded-xl p-6"
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted font-medium mb-2">
              Marca
            </label>
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="">Seleccioná marca...</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted font-medium mb-2">
              Modelo
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make || loadingModels}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
            >
              <option value="">
                {!make
                  ? "Seleccioná marca primero"
                  : loadingModels
                    ? "Cargando..."
                    : "Seleccioná modelo..."}
              </option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted font-medium mb-2">
              Año <span className="text-muted/40">(opcional)</span>
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="ej. 2015"
              min={1990}
              max={2026}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-black font-semibold text-sm hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Search className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Estimar Precio
        </button>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </form>

      {/* Resultado */}
      {result && (
        <div className="space-y-6">
          {/* Precio estimado */}
          <div className="bg-surface border border-accent/20 rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
            <div className="relative">
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-3">
                Valor Estimado de Mercado
              </p>
              <p
                className="text-5xl font-bold text-accent tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatUSD(result.estimated_price)}
              </p>
              <p className="text-sm text-muted mt-3">
                Basado en {result.sample_size} publicaciones activas de{" "}
                <span className="text-foreground font-medium">
                  {make} {model}
                </span>
                {year && <span className="text-foreground"> ({year})</span>}
              </p>
            </div>
          </div>

          {/* Rango de precios */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface border border-border-subtle rounded-xl p-5 text-center">
              <TrendingDown className="w-4 h-4 text-accent mx-auto mb-2" />
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1">
                Bajo (P25)
              </p>
              <p
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatUSD(result.p25)}
              </p>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-5 text-center">
              <Minus className="w-4 h-4 text-warning mx-auto mb-2" />
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1">
                Mediana
              </p>
              <p
                className="text-xl font-bold text-accent"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatUSD(result.estimated_price)}
              </p>
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-5 text-center">
              <TrendingUp className="w-4 h-4 text-danger mx-auto mb-2" />
              <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1">
                Alto (P75)
              </p>
              <p
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatUSD(result.p75)}
              </p>
            </div>
          </div>

          {/* Barra de rango */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Rango Completo de Precios
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted font-mono w-16 text-right">
                {formatUSD(result.min_price)}
              </span>
              <div className="flex-1 h-3 bg-surface-2 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-accent/20 rounded-full"
                  style={{
                    left: `${((result.p25 - result.min_price) / (result.max_price - result.min_price)) * 100}%`,
                    right: `${((result.max_price - result.p75) / (result.max_price - result.min_price)) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-accent"
                  style={{
                    left: `${((result.estimated_price - result.min_price) / (result.max_price - result.min_price)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted font-mono w-16">
                {formatUSD(result.max_price)}
              </span>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted px-20">
              <span>P25</span>
              <span>Mediana</span>
              <span>P75</span>
            </div>
          </div>

          {/* Histograma */}
          {distribution.length > 0 && (
            <div className="bg-surface border border-border-subtle rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Distribución de Precios
              </h3>
              <div className="flex items-end gap-1 h-32">
                {distribution.map((bucket) => (
                  <div
                    key={bucket.price}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <span className="text-[9px] text-muted opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {bucket.count}
                    </span>
                    <div
                      className="w-full rounded-t bg-accent/30 hover:bg-accent/50 transition-colors min-h-[2px]"
                      style={{
                        height: `${(bucket.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
