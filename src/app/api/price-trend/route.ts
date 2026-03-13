import { NextRequest, NextResponse } from "next/server";
import { getPriceTrend } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const make = req.nextUrl.searchParams.get("make");
  const model = req.nextUrl.searchParams.get("model");
  if (!make || !model) {
    return NextResponse.json({ error: "make and model required" }, { status: 400 });
  }
  const trend = await getPriceTrend(make, model);
  return NextResponse.json(trend);
}
