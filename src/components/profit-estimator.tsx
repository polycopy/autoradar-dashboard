"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calculator,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Receipt,
} from "lucide-react";

const DEFAULT_COSTS: Record<string, number> = {
  transferencia: 150,
  escribano: 100,
  inspeccion: 50,
  preparacion: 200,
  imprevistos: 100,
};

const COST_LABELS: Record<string, string> = {
  transferencia: "Transferencia",
  escribano: "Comisión escribano",
  inspeccion: "Inspección / VTV",
  preparacion: "Preparación",
  imprevistos: "Imprevistos",
};

const STORAGE_KEY = "autoradar-costs";

function loadCosts(): Record<string, number> {
  if (typeof window === "undefined") return { ...DEFAULT_COSTS };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults in case new cost keys are added
      return { ...DEFAULT_COSTS, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_COSTS };
}

function saveCosts(costs: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(costs));
  } catch {
    // ignore
  }
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function EditableValue({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select();
    }
  }, [editing]);

  // Sync external value changes
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  function commit() {
    setEditing(false);
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else {
      setDraft(String(value));
    }
  }

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="text-muted">US$</span>
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(String(value));
              setEditing(false);
            }
          }}
          className="w-20 bg-surface-2 border border-border-subtle rounded px-2 py-0.5 text-sm text-right text-foreground outline-none focus:border-accent"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm text-muted hover:text-foreground hover:bg-surface-2 rounded px-1.5 py-0.5 -mr-1.5 transition-colors cursor-text"
      style={{ fontFamily: "var(--font-mono)" }}
      title="Click para editar"
    >
      {formatUSD(value)}
    </button>
  );
}

export function ProfitEstimator({
  buyPrice,
  marketMedian,
  grade,
}: {
  buyPrice: number;
  marketMedian: number;
  grade: string;
}) {
  const [costs, setCosts] = useState<Record<string, number>>(DEFAULT_COSTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCosts(loadCosts());
    setMounted(true);
  }, []);

  function updateCost(key: string, value: number) {
    const next = { ...costs, [key]: value };
    setCosts(next);
    saveCosts(next);
  }

  function resetCosts() {
    setCosts({ ...DEFAULT_COSTS });
    saveCosts({ ...DEFAULT_COSTS });
  }

  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
  const grossMargin = marketMedian - buyPrice;
  const netProfit = grossMargin - totalCosts;
  const roi = buyPrice > 0 ? (netProfit / buyPrice) * 100 : 0;
  const isCustomized =
    mounted &&
    Object.keys(DEFAULT_COSTS).some((k) => costs[k] !== DEFAULT_COSTS[k]);

  return (
    <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">
            Estimador de Ganancia
          </h3>
          <span
            className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              grade === "A"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : grade === "B"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : grade === "C"
                    ? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                    : "bg-zinc-600/10 text-zinc-500"
            }`}
          >
            Grado {grade}
          </span>
        </div>
        {isCustomized && (
          <button
            onClick={resetCosts}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar valores
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Buy / Sell prices */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Precio de compra</span>
            <span
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatUSD(buyPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              Precio estimado de venta
            </span>
            <span
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatUSD(marketMedian)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Margen bruto
            </span>
            <span
              className={`text-sm font-bold ${grossMargin >= 0 ? "text-accent" : "text-danger"}`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {grossMargin >= 0
                ? formatUSD(grossMargin)
                : `−${formatUSD(Math.abs(grossMargin))}`}
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border-subtle" />

        {/* Itemized costs */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Receipt className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Costos estimados
            </span>
          </div>
          {Object.keys(DEFAULT_COSTS).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between pl-5"
            >
              <span className="text-sm text-muted">{COST_LABELS[key]}</span>
              <EditableValue
                value={costs[key] ?? DEFAULT_COSTS[key]}
                onChange={(v) => updateCost(key, v)}
              />
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-border-subtle" />

        {/* Total costs */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Total costos
          </span>
          <span
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            −{formatUSD(totalCosts)}
          </span>
        </div>

        {/* Separator */}
        <div className="border-t-2 border-border-subtle" />

        {/* Net profit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {netProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-accent" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger" />
            )}
            <span className="text-base font-bold text-foreground">
              Ganancia neta estimada
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-lg font-bold ${netProfit >= 0 ? "text-accent" : "text-danger"}`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {netProfit >= 0
                ? formatUSD(netProfit)
                : `−${formatUSD(Math.abs(netProfit))}`}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                roi >= 15
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : roi >= 5
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : roi >= 0
                      ? "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                      : "bg-red-500/15 text-red-700 dark:text-red-400"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {roi >= 0 ? "+" : ""}
              {roi.toFixed(1)}% ROI
            </span>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-[11px] text-muted pt-1">
          Hacé click en cualquier costo para editarlo. Tus valores se guardan
          automáticamente.
        </p>
      </div>
    </div>
  );
}
