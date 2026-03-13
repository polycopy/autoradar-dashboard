"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "autoradar-favorites";

export type FavoriteEntry = {
  id: string;
  addedAt: string;
  priceWhenAdded: number;
};

function readFavorites(): FavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: FavoriteEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // storage full or unavailable
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (id: string, price: number) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === id);
        const next = exists
          ? prev.filter((f) => f.id !== id)
          : [...prev, { id, addedAt: new Date().toISOString(), priceWhenAdded: price }];
        writeFavorites(next);
        return next;
      });
    },
    [],
  );

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      writeFavorites(next);
      return next;
    });
  }, []);

  const getFavorites = useCallback(() => favorites, [favorites]);

  return { favorites, toggleFavorite, isFavorite, getFavorites, removeFavorite };
}
