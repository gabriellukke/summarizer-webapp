import { NextRequest, NextResponse } from "next/server";
import { getSummaries, searchSummaries } from "@/db/queries";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim();

    const results = q && q.length > 0
      ? await searchSummaries(q)
      : await getSummaries();

    return NextResponse.json(results);
  } catch (err) {
    console.error("[GET /api/history]", err);
    return NextResponse.json({ error: "Failed to fetch history." }, { status: 500 });
  }
}
