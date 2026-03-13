"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({
  listingId,
  price,
  className,
}: {
  listingId: string;
  price: number;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(listingId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(listingId, price);
      }}
      className={`flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
        favorited
          ? "text-red-500 hover:text-red-400"
          : "text-muted hover:text-foreground"
      } ${className ?? "w-8 h-8"}`}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Heart
        className={`w-[1em] h-[1em] transition-all duration-200 ${
          favorited ? "fill-current" : ""
        }`}
        style={{ fontSize: "inherit" }}
      />
    </button>
  );
}
