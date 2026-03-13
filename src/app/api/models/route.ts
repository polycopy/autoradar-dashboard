import { NextRequest, NextResponse } from "next/server";
import { getModelsForMake } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const make = request.nextUrl.searchParams.get("make");
  if (!make) {
    return NextResponse.json({ models: [] });
  }
  const models = await getModelsForMake(make);
  return NextResponse.json({ models });
}
