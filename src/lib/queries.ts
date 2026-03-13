import { sql, Listing, TopRotation } from "./supabase";

export async function getOpportunities(filters?: {
  minPrice?: number;
  maxPrice?: number;
  makes?: string[];
  limit?: number;
}): Promise<Listing[]> {
  const minP = filters?.minPrice ?? 1500;
  const maxP = filters?.maxPrice ?? 25000;
  const lim = filters?.limit ?? 300;

  if (filters?.makes && filters.makes.length > 0) {
    return sql<Listing[]>`
      SELECT * FROM listings
      WHERE vehicle_type = 'car'
        AND status = 'live'
        AND make_normalized IS NOT NULL
        AND price_amount IS NOT NULL
        AND price_amount > ${minP}
        AND price_amount < ${maxP}
        AND make_normalized = ANY(${filters.makes})
      ORDER BY first_seen_at DESC
      LIMIT ${lim}
    `;
  }

  return sql<Listing[]>`
    SELECT * FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND make_normalized IS NOT NULL
      AND price_amount IS NOT NULL
      AND price_amount > ${minP}
      AND price_amount < ${maxP}
    ORDER BY first_seen_at DESC
    LIMIT ${lim}
  `;
}

export async function getMarketStats() {
  const rows = await sql`
    SELECT
      count(*) as total,
      count(*) FILTER (WHERE status = 'live') as live,
      count(*) FILTER (WHERE status IN ('sold','unlive')) as sold,
      count(*) FILTER (WHERE is_dealer = true AND status = 'live') as dealers
    FROM listings
    WHERE vehicle_type = 'car'
  `;
  const r = rows[0];
  return {
    total: Number(r.total),
    live: Number(r.live),
    sold: Number(r.sold),
    dealers: Number(r.dealers),
  };
}

export async function getTopRotation(limit = 20): Promise<TopRotation[]> {
  const rows = await sql`
    SELECT * FROM mv_top_rotation
    ORDER BY sell_rate_pct DESC
    LIMIT ${limit}
  `;
  return rows as unknown as TopRotation[];
}

export async function getUniqueMakes(): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT make_normalized
    FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND make_normalized IS NOT NULL
    ORDER BY make_normalized
  `;
  return rows.map((r) => r.make_normalized);
}

export async function getModelsForMake(make: string): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT model_normalized
    FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND make_normalized = ${make}
      AND model_normalized IS NOT NULL
    ORDER BY model_normalized
  `;
  return rows.map((r) => r.model_normalized);
}

export async function searchListings(query: string, limit = 30): Promise<Listing[]> {
  const pattern = `%${query}%`;
  return sql<Listing[]>`
    SELECT * FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND (
        title ILIKE ${pattern}
        OR make_normalized ILIKE ${pattern}
        OR model_normalized ILIKE ${pattern}
      )
    ORDER BY first_seen_at DESC
    LIMIT ${limit}
  `;
}

export async function getMakeDistribution(): Promise<{ make: string; count: number }[]> {
  const rows = await sql`
    SELECT make_normalized as make, count(*)::int as count
    FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND make_normalized IS NOT NULL
    GROUP BY make_normalized
    ORDER BY count DESC
    LIMIT 15
  `;
  return rows as unknown as { make: string; count: number }[];
}

export async function getPriceSegmentDistribution(): Promise<{ segment: string; count: number; avg_price: number }[]> {
  const rows = await sql`
    SELECT
      price_segment as segment,
      count(*)::int as count,
      round(avg(price_amount))::int as avg_price
    FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND price_segment IS NOT NULL
      AND price_amount IS NOT NULL
    GROUP BY price_segment
    ORDER BY avg_price ASC
  `;
  return rows as unknown as { segment: string; count: number; avg_price: number }[];
}

export async function getUniqueCities(): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT location_city
    FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND location_city IS NOT NULL
    ORDER BY location_city
  `;
  return rows.map((r) => r.location_city);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const rows = await sql<Listing[]>`
    SELECT * FROM listings WHERE fb_listing_id = ${id} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getPriceHistory(listingDbId: number) {
  return sql`
    SELECT price_amount, price_currency, observed_at
    FROM price_history
    WHERE listing_id = ${listingDbId}
    ORDER BY observed_at ASC
  `;
}

export async function getSimilarListings(
  make: string,
  model: string,
  excludeId: string,
  limit = 6,
): Promise<Listing[]> {
  return sql<Listing[]>`
    SELECT * FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND make_normalized = ${make}
      AND model_normalized = ${model}
      AND fb_listing_id != ${excludeId}
      AND price_amount IS NOT NULL
    ORDER BY first_seen_at DESC
    LIMIT ${limit}
  `;
}

export async function getMarketMedians(): Promise<
  Map<string, { median: number; count: number }>
> {
  const rows = await sql`
    SELECT make_normalized, model_normalized,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY price_amount) as median,
      count(*) as cnt
    FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND is_dealer = false
      AND make_normalized IS NOT NULL
      AND model_normalized IS NOT NULL
      AND price_amount IS NOT NULL
      AND price_amount > 500
    GROUP BY make_normalized, model_normalized
    HAVING count(*) >= 3
  `;

  const medians = new Map<string, { median: number; count: number }>();
  for (const r of rows) {
    const key = `${r.make_normalized}|${r.model_normalized}`;
    medians.set(key, { median: Number(r.median), count: Number(r.cnt) });
  }
  return medians;
}

export async function getValuation(
  make: string,
  model: string,
  year?: number,
): Promise<{
  estimated_price: number;
  sample_size: number;
  min_price: number;
  max_price: number;
  p25: number;
  p75: number;
} | null> {
  const rows = year
    ? await sql`
        SELECT price_amount FROM listings
        WHERE vehicle_type = 'car' AND status = 'live'
          AND make_normalized ILIKE ${make}
          AND model_normalized ILIKE ${model}
          AND price_amount IS NOT NULL AND price_amount > 500
          AND vehicle_year >= ${year - 2} AND vehicle_year <= ${year + 2}
        ORDER BY price_amount
      `
    : await sql`
        SELECT price_amount FROM listings
        WHERE vehicle_type = 'car' AND status = 'live'
          AND make_normalized ILIKE ${make}
          AND model_normalized ILIKE ${model}
          AND price_amount IS NOT NULL AND price_amount > 500
        ORDER BY price_amount
      `;

  if (rows.length < 3) return null;

  const prices = rows.map((r) => Number(r.price_amount));
  const mid = Math.floor(prices.length / 2);
  const median =
    prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];

  return {
    estimated_price: median,
    sample_size: prices.length,
    min_price: prices[0],
    max_price: prices[prices.length - 1],
    p25: prices[Math.floor(prices.length * 0.25)],
    p75: prices[Math.floor(prices.length * 0.75)],
  };
}

export async function getPriceDistribution(
  make: string,
  model: string,
): Promise<{ price: number; count: number }[]> {
  const rows = await sql`
    SELECT price_amount FROM listings
    WHERE vehicle_type = 'car' AND status = 'live'
      AND make_normalized ILIKE ${make}
      AND model_normalized ILIKE ${model}
      AND price_amount IS NOT NULL AND price_amount > 500
  `;

  if (rows.length === 0) return [];

  const prices = rows.map((r) => Number(r.price_amount));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const bucketSize = Math.max(500, Math.round((max - min) / 15 / 500) * 500);
  const buckets = new Map<number, number>();

  for (const p of prices) {
    const bucket = Math.floor(p / bucketSize) * bucketSize;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([price, count]) => ({ price, count }))
    .sort((a, b) => a.price - b.price);
}

export async function getAvgDaysToSell(): Promise<Map<string, number>> {
  const rows = await sql`
    SELECT
      make_normalized,
      model_normalized,
      round(avg(days_listed))::int as avg_days
    FROM listings
    WHERE vehicle_type = 'car'
      AND status IN ('sold', 'unlive')
      AND days_listed IS NOT NULL
      AND days_listed > 0
      AND days_listed < 180
      AND make_normalized IS NOT NULL
      AND model_normalized IS NOT NULL
    GROUP BY make_normalized, model_normalized
    HAVING count(*) >= 2
  `;
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(`${r.make_normalized}|${r.model_normalized}`, Number(r.avg_days));
  }
  return map;
}

export async function getSoldListings(filters?: {
  limit?: number;
  makes?: string[];
  minPrice?: number;
  maxPrice?: number;
}): Promise<Listing[]> {
  const lim = filters?.limit ?? 200;
  const minP = filters?.minPrice ?? 500;
  const maxP = filters?.maxPrice ?? 100000;

  if (filters?.makes && filters.makes.length > 0) {
    return sql<Listing[]>`
      SELECT * FROM listings
      WHERE vehicle_type = 'car'
        AND status IN ('sold', 'unlive')
        AND make_normalized IS NOT NULL
        AND price_amount IS NOT NULL
        AND price_amount > ${minP}
        AND price_amount < ${maxP}
        AND make_normalized = ANY(${filters.makes})
      ORDER BY last_seen_at DESC
      LIMIT ${lim}
    `;
  }

  return sql<Listing[]>`
    SELECT * FROM listings
    WHERE vehicle_type = 'car'
      AND status IN ('sold', 'unlive')
      AND make_normalized IS NOT NULL
      AND price_amount IS NOT NULL
      AND price_amount > ${minP}
      AND price_amount < ${maxP}
    ORDER BY last_seen_at DESC
    LIMIT ${lim}
  `;
}

export async function getSoldStats() {
  const rows = await sql`
    SELECT
      count(*) as total_sold,
      round(avg(days_listed))::int as avg_days,
      round(avg(price_amount))::int as avg_price,
      round(percentile_cont(0.5) WITHIN GROUP (ORDER BY days_listed))::int as median_days
    FROM listings
    WHERE vehicle_type = 'car'
      AND status IN ('sold', 'unlive')
      AND days_listed IS NOT NULL
      AND days_listed > 0
      AND price_amount IS NOT NULL
      AND price_amount > 500
  `;
  const r = rows[0];
  return {
    total_sold: Number(r.total_sold ?? 0),
    avg_days: Number(r.avg_days ?? 0),
    avg_price: Number(r.avg_price ?? 0),
    median_days: Number(r.median_days ?? 0),
  };
}

export async function getRotationByModel(limit = 20): Promise<{
  vehicle: string;
  make: string;
  model: string;
  total: number;
  sold: number;
  sell_rate: number;
  avg_days: number;
  avg_price: number;
}[]> {
  const rows = await sql`
    SELECT
      make_normalized || ' ' || model_normalized as vehicle,
      make_normalized as make,
      model_normalized as model,
      count(*) as total,
      count(*) FILTER (WHERE status IN ('sold', 'unlive')) as sold,
      round(100.0 * count(*) FILTER (WHERE status IN ('sold', 'unlive')) / count(*))::int as sell_rate,
      round(avg(days_listed) FILTER (WHERE status IN ('sold', 'unlive') AND days_listed > 0))::int as avg_days,
      round(avg(price_amount) FILTER (WHERE status IN ('sold', 'unlive')))::int as avg_price
    FROM listings
    WHERE vehicle_type = 'car'
      AND make_normalized IS NOT NULL
      AND model_normalized IS NOT NULL
      AND price_amount IS NOT NULL
      AND price_amount > 500
    GROUP BY make_normalized, model_normalized
    HAVING count(*) >= 3 AND count(*) FILTER (WHERE status IN ('sold', 'unlive')) >= 1
    ORDER BY sell_rate DESC, sold DESC
    LIMIT ${limit}
  `;
  return rows as unknown as any[];
}

export async function getDemandSupply(limit = 25): Promise<{
  vehicle: string;
  make: string;
  model: string;
  live: number;
  sold: number;
  total: number;
  sell_rate: number;
  avg_days: number | null;
  demand_score: number;
}[]> {
  const rows = await sql`
    SELECT
      make_normalized || ' ' || model_normalized as vehicle,
      make_normalized as make,
      model_normalized as model,
      count(*) FILTER (WHERE status = 'live') as live,
      count(*) FILTER (WHERE status IN ('sold', 'unlive')) as sold,
      count(*) as total,
      round(100.0 * count(*) FILTER (WHERE status IN ('sold', 'unlive')) / NULLIF(count(*), 0))::int as sell_rate,
      round(avg(days_listed) FILTER (WHERE status IN ('sold', 'unlive') AND days_listed > 0 AND days_listed < 180))::int as avg_days
    FROM listings
    WHERE vehicle_type = 'car'
      AND make_normalized IS NOT NULL
      AND model_normalized IS NOT NULL
      AND price_amount IS NOT NULL
      AND price_amount > 500
    GROUP BY make_normalized, model_normalized
    HAVING count(*) >= 5
    ORDER BY sell_rate DESC, sold DESC
    LIMIT ${limit}
  `;
  return (rows as unknown as any[]).map(r => ({
    ...r,
    live: Number(r.live),
    sold: Number(r.sold),
    total: Number(r.total),
    sell_rate: Number(r.sell_rate ?? 0),
    avg_days: r.avg_days ? Number(r.avg_days) : null,
    // Demand score: high sell_rate + low avg_days = high demand
    demand_score: Math.min(100, Math.round(
      (Number(r.sell_rate ?? 0) * 0.7) +
      (r.avg_days ? Math.max(0, (60 - Number(r.avg_days))) * 0.5 : 0)
    )),
  }));
}

export async function getPriceTrend(
  make: string,
  model: string,
): Promise<{ date: string; median: number; count: number }[]> {
  const rows = await sql`
    SELECT
      date_trunc('week', first_seen_at)::date as week,
      round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price_amount))::int as median,
      count(*)::int as count
    FROM listings
    WHERE vehicle_type = 'car'
      AND make_normalized = ${make}
      AND model_normalized = ${model}
      AND price_amount IS NOT NULL
      AND price_amount > 500
      AND first_seen_at > now() - interval '6 months'
    GROUP BY date_trunc('week', first_seen_at)
    HAVING count(*) >= 2
    ORDER BY week ASC
  `;
  return rows.map(r => ({
    date: String(r.week),
    median: Number(r.median),
    count: Number(r.count),
  }));
}

export async function getTopModelsForTrend(limit = 10): Promise<{ make: string; model: string; count: number }[]> {
  const rows = await sql`
    SELECT make_normalized as make, model_normalized as model, count(*)::int as count
    FROM listings
    WHERE vehicle_type = 'car'
      AND status = 'live'
      AND make_normalized IS NOT NULL
      AND model_normalized IS NOT NULL
      AND price_amount IS NOT NULL
      AND price_amount > 500
    GROUP BY make_normalized, model_normalized
    HAVING count(*) >= 5
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return rows as unknown as { make: string; model: string; count: number }[];
}
