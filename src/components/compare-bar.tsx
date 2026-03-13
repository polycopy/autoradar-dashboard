"use client";

import { useRouter } from "next/navigation";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/lib/compare";

export function CompareBar() {
  const router = useRouter();
  const { selectedIds, selectedCount, clearCompare } = useCompare();

  if (selectedCount === 0) return null;

  const handleCompare = () => {
    router.push(`/compare?ids=${selectedIds.join(",")}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-64">
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-xl bg-surface/80 backdrop-blur-xl border border-accent/20 shadow-lg shadow-accent/5">
          {/* Left: count */}
          <div className="flex items-center gap-3">
            <Scale className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface-2 border border-border-subtle transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
            <button
              onClick={handleCompare}
              disabled={selectedCount < 2}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-accent text-white dark:text-black hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Comparar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
