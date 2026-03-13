"use client";

import { useEffect, useState } from "react";
import { Heart, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { useFavorites, FavoriteEntry } from "@/lib/favorites";
import { ListingCard } from "@/components/listing-card";
import { formatUSD, discountToGrade } from "@/lib/utils";
import type { Listing } from "@/lib/supabase";

type MedianMap = Record<string, { median: number; count: number }>;

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);
  const [medians, setMedians] = useState<MedianMap>({});
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Track mount to avoid hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch listing data when favorites change
  useEffect(() => {
    if (!hasMounted) return;

    if (favorites.length === 0) {
      setListings([]);
      setMedians({});
      setLoading(false);
      return;
    }

    const ids = favorites.map((f) => f.id).join(",");
    setLoading(true);

    fetch(`/api/favorites?ids=${encodeURIComponent(ids)}`)
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
  }, [favorites, hasMounted]);

  // Build a lookup from id -> favorite entry for price tracking
  const favMap = new Map<string, FavoriteEntry>();
  for (const f of favorites) {
    favMap.set(f.id, f);
  }

  // Sort listings by the order they were favorited (newest first)
  const sortedListings = [...listings].sort((a, b) => {
    const fa = favMap.get(a.fb_listing_id);
    const fb = favMap.get(b.fb_listing_id);
    if (!fa || !fb) return 0;
    return new Date(fb.addedAt).getTime() - new Date(fa.addedAt).getTime();
  });

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Favoritos
        </h1>
        <p className="text-sm text-muted mt-1">
          {favorites.length === 0
            ? "No tenés favoritos guardados"
            : `${favorites.length} vehículo${favorites.length !== 1 ? "s" : ""} guardado${favorites.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Loading */}
      {loading && favorites.length > 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && favorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Sin favoritos
          </h2>
          <p className="text-sm text-muted max-w-sm">
            Tocá el corazón en cualquier listado para guardarlo acá y hacer seguimiento de precios.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && sortedListings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedListings.map((listing) => {
            const fav = favMap.get(listing.fb_listing_id);
            const currentPrice = Number(listing.price_amount ?? 0);
            const priceWhenAdded = fav?.priceWhenAdded ?? 0;
            const priceDiff =
              priceWhenAdded > 0 && currentPrice > 0
                ? currentPrice - priceWhenAdded
                : 0;

            const key = `${listing.make_normalized}|${listing.model_normalized}`;
            const ref = medians[key];
            const discount = ref
              ? Math.max(0, ((ref.median - currentPrice) / ref.median) * 100)
              : 0;
            const margin = ref ? ref.median - currentPrice - 400 : 0;
            const grade = ref ? discountToGrade(discount, margin) : "D";

            return (
              <div key={listing.fb_listing_id} className="relative">
                {/* Price change badge */}
                {priceDiff !== 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold backdrop-blur-sm ${
                        priceDiff < 0
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/20 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {priceDiff < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      {priceDiff < 0 ? "Bajó" : "Subió"}{" "}
                      {formatUSD(Math.abs(priceDiff))}
                    </span>
                  </div>
                )}
                <ListingCard
                  listing={listing}
                  discount={discount}
                  median={ref?.median ?? 0}
                  grade={grade}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
