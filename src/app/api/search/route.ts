import { NextRequest, NextResponse } from "next/server";
import { searchListings } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const results = await searchListings(q, 20);
  return NextResponse.json({ results });
}
