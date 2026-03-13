import { NextRequest, NextResponse } from "next/server";
import { getValuation, getPriceDistribution } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const yearStr = searchParams.get("year");

  if (!make || !model) {
    return NextResponse.json(
      { error: "Marca y modelo son obligatorios" },
      { status: 400 },
    );
  }

  const year = yearStr ? parseInt(yearStr) : undefined;

  const [valuation, distribution] = await Promise.all([
    getValuation(make, model, year),
    getPriceDistribution(make, model),
  ]);

  if (!valuation) {
    return NextResponse.json(
      { error: "No hay suficientes datos para este vehículo" },
      { status: 404 },
    );
  }

  return NextResponse.json({ valuation, distribution });
}
