import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Gauge,
  Calendar,
  Fuel,
  Clock,
  User,
  ChevronDown,
  Car,
  Eye,
  TrendingDown,
  TrendingUp,
  Minus,
  Timer,
} from "lucide-react";
import {
  getListingById,
  getPriceHistory,
  getMarketMedians,
  getSimilarListings,
  getAvgDaysToSell,
} from "@/lib/queries";
import { formatUSD, formatKm, timeAgo, gradeColor, discountToGrade } from "@/lib/utils";
import { ListingCard } from "@/components/listing-card";
import { FavoriteButton } from "@/components/favorite-button";
import { ProfitEstimator } from "@/components/profit-estimator";
import { DealScore } from "@/components/deal-score";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(decodeURIComponent(id));
  if (!listing) notFound();

  const [priceHistory, medians, similar, avgDays] = await Promise.all([
    getPriceHistory(listing.id),
    getMarketMedians(),
    listing.make_normalized && listing.model_normalized
      ? getSimilarListings(
          listing.make_normalized,
          listing.model_normalized,
          listing.fb_listing_id,
        )
      : Promise.resolve([]),
    getAvgDaysToSell(),
  ]);

  // Market data
  const key = `${listing.make_normalized}|${listing.model_normalized}`;
  const ref = medians.get(key);
  const price = Number(listing.price_amount ?? 0);
  const discount = ref ? ((ref.median - price) / ref.median) * 100 : 0;
  const margin = ref ? ref.median - price - 400 : 0;
  const grade = ref ? discountToGrade(discount, margin) : "D";
  const avgDaysToSell = avgDays.get(key) ?? null;

  const source =
    listing.source ??
    (listing.fb_listing_id.startsWith("ML-") ? "mercadolibre" : "facebook");

  const hasImage =
    listing.primary_image_url &&
    !listing.primary_image_url.includes("null");

  const specs = [
    { label: "Año", value: listing.vehicle_year, icon: Calendar },
    {
      label: "Kilómetros",
      value: listing.vehicle_odometer_value
        ? formatKm(listing.vehicle_odometer_value)
        : null,
      icon: Gauge,
    },
    { label: "Combustible", value: listing.vehicle_fuel_type, icon: Fuel },
    { label: "Transmisión", value: listing.vehicle_transmission, icon: Car },
    { label: "Color", value: listing.vehicle_exterior_color, icon: Eye },
    { label: "Condición", value: listing.vehicle_condition, icon: TrendingUp },
  ].filter((s) => s.value);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a oportunidades
      </Link>

      {/* Main card */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-surface-2 lg:min-h-[400px]">
            {hasImage ? (
              <Image
                src={listing.primary_image_url!}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted">
                <Car className="w-20 h-20 opacity-20" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {grade !== "D" && (
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${gradeColor(grade)}`}
                >
                  Grado {grade}
                </span>
              )}
              {discount > 0 && (
                <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-accent/90 text-white dark:text-black">
                  -{Math.round(discount)}% bajo mercado
                </span>
              )}
            </div>

            {/* Source */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm ${
                  source === "mercadolibre"
                    ? "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30 dark:text-yellow-300 dark:border-yellow-500/20"
                    : "bg-blue-500/20 text-blue-700 border border-blue-500/30 dark:text-blue-300 dark:border-blue-500/20"
                }`}
              >
                {source === "mercadolibre" ? "MercadoLibre" : "Facebook"}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 lg:p-8 flex flex-col">
            {/* Title */}
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {listing.make_normalized && listing.model_normalized
                ? `${listing.make_normalized} ${listing.model_normalized}`
                : listing.title}
              {listing.vehicle_year && (
                <span className="text-muted ml-2">{listing.vehicle_year}</span>
              )}
            </h1>

            {listing.title &&
              listing.make_normalized &&
              listing.title.toLowerCase() !==
                `${listing.make_normalized} ${listing.model_normalized}`.toLowerCase() && (
                <p className="text-sm text-muted mt-1 line-clamp-2">
                  {listing.title}
                </p>
              )}

            {/* Price block */}
            <div className="mt-6 p-4 bg-surface-2 rounded-xl border border-border-subtle">
              <div className="flex items-baseline gap-3">
                <span
                  className="text-3xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {price > 0 ? formatUSD(price) : "—"}
                </span>
                {listing.price_drop_count > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-warning">
                    <ChevronDown className="w-3 h-3" />
                    {listing.price_drop_count} baja
                    {listing.price_drop_count > 1 ? "s" : ""} de precio
                  </span>
                )}
              </div>

              {ref && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Mediana mercado
                    </p>
                    <p
                      className="text-sm font-semibold text-foreground mt-0.5"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatUSD(ref.median)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Descuento
                    </p>
                    <p
                      className={`text-sm font-semibold mt-0.5 ${discount > 0 ? "text-accent" : "text-danger"}`}
                    >
                      {discount > 0 ? `-${Math.round(discount)}%` : `+${Math.round(Math.abs(discount))}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Margen est.
                    </p>
                    <p
                      className={`text-sm font-semibold mt-0.5 ${margin > 0 ? "text-accent" : "text-danger"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {margin > 0 ? formatUSD(margin) : `-${formatUSD(Math.abs(margin))}`}
                    </p>
                  </div>
                </div>
              )}

              {discount > 0 && (
                <div className="mt-4">
                  <DealScore discount={discount} grade={grade} />
                </div>
              )}
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg border border-border-subtle"
                  >
                    <s.icon className="w-4 h-4 text-muted flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted uppercase tracking-wider">
                        {s.label}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {String(s.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted">
              {listing.location_city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location_city}
                  {listing.location_state ? `, ${listing.location_state}` : ""}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Visto {timeAgo(listing.first_seen_at)}
              </span>
              {listing.times_seen > 1 && (
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {listing.times_seen} veces detectado
                </span>
              )}
              {avgDaysToSell != null && (
                <span className="inline-flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  Se vende en ~{avgDaysToSell} días
                </span>
              )}
              {listing.seller_name && (
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {listing.seller_name}
                  {listing.is_dealer && " (Dealer)"}
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="mt-auto pt-6 flex items-center gap-3">
              <a
                href={listing.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white dark:text-black font-semibold text-sm hover:bg-accent-dim transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver en {source === "mercadolibre" ? "MercadoLibre" : "Facebook"}
              </a>
              <FavoriteButton listingId={listing.fb_listing_id} price={price} className="w-10 h-10 text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Profit estimator */}
      {ref && price > 0 && (
        <ProfitEstimator
          buyPrice={price}
          marketMedian={ref.median}
          grade={grade}
        />
      )}

      {/* Description */}
      {listing.description && (
        <div className="bg-surface border border-border-subtle rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Descripción
          </h3>
          <p className="text-sm text-muted whitespace-pre-line leading-relaxed">
            {listing.description}
          </p>
        </div>
      )}

      {/* Price history */}
      {priceHistory.length > 1 && (
        <div className="bg-surface border border-border-subtle rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Historial de Precios
          </h3>
          <div className="space-y-2">
            {priceHistory.map((ph, i) => {
              const prev = i > 0 ? Number(priceHistory[i - 1].price_amount) : null;
              const curr = Number(ph.price_amount);
              const diff = prev ? curr - prev : null;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2 bg-surface-2 rounded-lg"
                >
                  <span className="text-xs text-muted">
                    {new Date(ph.observed_at as string).toLocaleDateString("es-UY", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    {diff !== null && diff !== 0 && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          diff < 0 ? "text-accent" : "text-danger"
                        }`}
                      >
                        {diff < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {diff < 0 ? "-" : "+"}
                        {formatUSD(Math.abs(diff))}
                      </span>
                    )}
                    {diff === null && i === 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Minus className="w-3 h-3" />
                        Precio inicial
                      </span>
                    )}
                    <span
                      className="text-sm font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatUSD(curr)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Similar listings */}
      {similar.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Otros {listing.make_normalized} {listing.model_normalized} en venta
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {similar.map((s) => {
              const sKey = `${s.make_normalized}|${s.model_normalized}`;
              const sRef = medians.get(sKey);
              const sPrice = Number(s.price_amount ?? 0);
              const sDiscount = sRef
                ? Math.max(0, ((sRef.median - sPrice) / sRef.median) * 100)
                : 0;
              const sMargin = sRef ? sRef.median - sPrice - 400 : 0;
              const sGrade = sRef ? discountToGrade(sDiscount, sMargin) : "D";
              return (
                <ListingCard
                  key={s.fb_listing_id}
                  listing={s}
                  discount={sDiscount}
                  median={sRef?.median ?? 0}
                  grade={sGrade}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
