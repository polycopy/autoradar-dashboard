import postgres from "postgres";

export const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export type Listing = {
  id: number;
  fb_listing_id: string;
  title: string;
  description: string | null;
  price_amount: number | null;
  price_currency: string;
  initial_price: number | null;
  last_price: number | null;
  price_drop_count: number;
  had_price_change: boolean;
  location_city: string | null;
  location_state: string | null;
  location_display: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_odometer_value: number | null;
  vehicle_condition: string | null;
  vehicle_fuel_type: string | null;
  vehicle_transmission: string | null;
  vehicle_exterior_color: string | null;
  make_normalized: string | null;
  model_normalized: string | null;
  price_segment: string | null;
  year_segment: string | null;
  km_segment: string | null;
  seller_name: string | null;
  seller_type: string | null;
  is_dealer: boolean;
  is_sold: boolean;
  is_live: boolean;
  status: string;
  days_listed: number | null;
  times_seen: number;
  vehicle_type: string | null;
  primary_image_url: string | null;
  listing_url: string;
  first_seen_at: string;
  last_seen_at: string;
  source: string | null;
};

export type TopRotation = {
  vehicle: string;
  make: string;
  model: string;
  total_seen: number;
  sold: number;
  sell_rate_pct: number;
  avg_days: number;
  avg_price: number;
};
