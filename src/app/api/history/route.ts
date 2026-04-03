import { NextRequest, NextResponse } from "next/server";
import { getSummaries, searchSummaries } from "@/db/queries";
import { getRequiredUser } from "@/lib/supabase/user";

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await getRequiredUser();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim();

    const results = q && q.length > 0
      ? await searchSummaries(q, user.id)
      : await getSummaries(user.id);

    return NextResponse.json(results);
  } catch (err) {
    console.error("[GET /api/history]", err);
    return NextResponse.json({ error: "Failed to fetch history." }, { status: 500 });
  }
}
