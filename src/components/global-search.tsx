"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Car, MapPin } from "lucide-react";
import { formatUSD } from "@/lib/utils";

type SearchResult = {
  fb_listing_id: string;
  title: string;
  make_normalized: string | null;
  model_normalized: string | null;
  vehicle_year: number | null;
  price_amount: number | null;
  location_city: string | null;
  primary_image_url: string | null;
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300) as unknown as NodeJS.Timeout;
  }

  function handleSelect(id: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/listing/${encodeURIComponent(id)}`);
  }

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Buscar auto... (⌘K)"
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface-2 border border-border-subtle text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-subtle rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {loading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">
              Buscando...
            </div>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-6 text-center text-sm text-muted">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((r) => (
            <button
              key={r.fb_listing_id}
              onClick={() => handleSelect(r.fb_listing_id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left border-b border-border-subtle/50 last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border-subtle flex items-center justify-center flex-shrink-0 overflow-hidden">
                {r.primary_image_url ? (
                  <img
                    src={r.primary_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Car className="w-4 h-4 text-muted" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {r.make_normalized && r.model_normalized
                    ? `${r.make_normalized} ${r.model_normalized}`
                    : r.title}
                  {r.vehicle_year && (
                    <span className="text-muted ml-1">{r.vehicle_year}</span>
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {r.price_amount && (
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {formatUSD(Number(r.price_amount))}
                    </span>
                  )}
                  {r.location_city && (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {r.location_city}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
