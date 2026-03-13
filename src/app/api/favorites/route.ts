import { NextRequest, NextResponse } from "next/server";
import { sql, Listing } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ listings: [], medians: {} });
  }

  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100); // limit to 100

  if (ids.length === 0) {
    return NextResponse.json({ listings: [], medians: {} });
  }

  // Fetch listings
  const listings = await sql<Listing[]>`
    SELECT * FROM listings
    WHERE fb_listing_id = ANY(${ids})
  `;

  // Compute medians for the make|model combos in these listings
  const combos = new Set<string>();
  for (const l of listings) {
    if (l.make_normalized && l.model_normalized) {
      combos.add(`${l.make_normalized}|${l.model_normalized}`);
    }
  }

  const medians: Record<string, { median: number; count: number }> = {};

  if (combos.size > 0) {
    const makes: string[] = [];
    const models: string[] = [];
    for (const c of combos) {
      const [make, model] = c.split("|");
      makes.push(make);
      models.push(model);
    }

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

    for (const r of rows) {
      const key = `${r.make_normalized}|${r.model_normalized}`;
      if (combos.has(key)) {
        medians[key] = { median: Number(r.median), count: Number(r.cnt) };
      }
    }
  }

  return NextResponse.json({ listings, medians });
}
