"use client";

import { Scale } from "lucide-react";
import { useCompare } from "@/lib/compare";

export function CompareToggle({ listingId }: { listingId: string }) {
  const { toggleCompare, isSelected, selectedCount } = useCompare();
  const selected = isSelected(listingId);
  const disabled = !selected && selectedCount >= 3;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) toggleCompare(listingId);
      }}
      disabled={disabled}
      className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
        selected
          ? "text-accent bg-accent/10 hover:bg-accent/20"
          : disabled
            ? "text-muted/30 cursor-not-allowed"
            : "text-muted hover:text-foreground"
      }`}
      aria-label={selected ? "Quitar de comparación" : "Comparar"}
      title={
        selected
          ? "Quitar de comparación"
          : disabled
            ? "Máximo 3 para comparar"
            : "Comparar"
      }
    >
      <Scale
        className={`w-[1em] h-[1em] transition-all duration-200 ${
          selected ? "fill-current" : ""
        }`}
        style={{ fontSize: "inherit" }}
      />
    </button>
  );
}
