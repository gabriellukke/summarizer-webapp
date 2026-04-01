import { NextRequest, NextResponse } from "next/server";
import { deleteSummary } from "@/db/queries";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    await deleteSummary(numericId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/summaries/:id]", err);
    return NextResponse.json({ error: "Failed to delete summary." }, { status: 500 });
  }
}
