"use client";

import { useState } from "react";
import { Radar } from "lucide-react";
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
}: {
  listings: ScoredListing[];
}) {
  const [filter, setFilter] = useState<"all" | "A" | "B" | "C">("all");

  const filtered =
    filter === "all"
      ? listings.filter((l) => l.grade !== "D")
      : listings.filter((l) => l.grade === filter);

  const countByGrade = (g: string) =>
    listings.filter((l) => l.grade === g).length;

  return (
    <>
      {/* Filtros */}
      <div className="flex items-center gap-2">
        {(["all", "A", "B", "C"] as const).map((g) => {
          const count =
            g === "all"
              ? listings.filter((l) => l.grade !== "D").length
              : countByGrade(g);
          return (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === g
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-surface text-muted border-border-subtle hover:border-border hover:text-foreground"
              }`}
            >
              {g === "all" ? "Todos" : `Grado ${g}`}
              <span className="ml-2 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <Radar className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No se encontraron oportunidades</p>
          <p className="text-sm mt-1">
            El scanner corre cada 35 minutos — volvé a revisar pronto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
    </>
  );
}
