import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Gauge, ChevronDown, Car } from "lucide-react";
import { formatUSD, formatKm, timeAgo, gradeColor } from "@/lib/utils";
import type { Listing } from "@/lib/supabase";

export function ListingCard({
  listing,
  discount,
  median,
  grade,
}: {
  listing: Listing;
  discount: number;
  median: number;
  grade: string;
}) {
  const hasImage =
    listing.primary_image_url &&
    !listing.primary_image_url.includes("null");

  const source = listing.source ?? (listing.fb_listing_id.startsWith("ML-") ? "mercadolibre" : "facebook");

  return (
    <Link
      href={`/listing/${encodeURIComponent(listing.fb_listing_id)}`}
      className="group bg-surface border border-border-subtle rounded-xl overflow-hidden card-glow flex flex-col"
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] bg-surface-2 overflow-hidden">
        {hasImage ? (
          <Image
            src={listing.primary_image_url!}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <Car className="w-12 h-12 opacity-20" />
          </div>
        )}

        {/* Grade badge */}
        {grade !== "D" && (
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold tracking-wider border ${gradeColor(grade)}`}
            >
              {grade}
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-accent/90 text-black">
              -{Math.round(discount)}%
            </span>
          </div>
        )}

        {/* Price drops */}
        {listing.price_drop_count > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-black/60 text-warning backdrop-blur-sm">
              <ChevronDown className="w-3 h-3" />
              {listing.price_drop_count}x baja
            </span>
          </div>
        )}

        {/* Source badge */}
        <div className="absolute bottom-3 right-3">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium backdrop-blur-sm ${
              source === "mercadolibre"
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/20"
            }`}
          >
            {source === "mercadolibre" ? "ML" : "FB"}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
            {listing.make_normalized && listing.model_normalized
              ? `${listing.make_normalized} ${listing.model_normalized}`
              : listing.title}
            {listing.vehicle_year && (
              <span className="text-muted ml-1">{listing.vehicle_year}</span>
            )}
          </h3>
        </div>

        {/* Precio */}
        <div className="mb-3">
          <span
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {listing.price_amount
              ? formatUSD(Number(listing.price_amount))
              : "—"}
          </span>
          {median > 0 && (
            <span className="text-xs text-muted ml-2">
              mkt {formatUSD(median)}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {listing.location_city && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 text-[11px] text-muted">
              <MapPin className="w-3 h-3" />
              {listing.location_city}
            </span>
          )}
          {listing.vehicle_odometer_value &&
            listing.vehicle_odometer_value > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 text-[11px] text-muted">
                <Gauge className="w-3 h-3" />
                {formatKm(listing.vehicle_odometer_value)}
              </span>
            )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-2 text-[11px] text-muted">
            <Clock className="w-3 h-3" />
            {timeAgo(listing.first_seen_at)}
          </span>
          {listing.is_dealer && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-[11px] text-amber-400 border border-amber-500/20">
              Dealer
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
