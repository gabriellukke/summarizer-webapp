import { NextRequest, NextResponse } from "next/server";
import { extractText, ExtractionError } from "@/services/extract";
import { summarizeText } from "@/services/summarize";
import { insertSummary } from "@/db/queries";
import { getRatelimit } from "@/lib/ratelimit";
import { getRequiredUser } from "@/lib/supabase/user";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MIN_TEXT_LENGTH,
  MAX_TEXT_LENGTH,
} from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await getRequiredUser();
  if (unauthorized) return unauthorized;

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await getRatelimit().limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    let extractedText: string;
    let title: string;

    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "File exceeds 4MB limit." }, { status: 413 });
      }

      const mimeType = file.type;
      if (!ACCEPTED_MIME_TYPES.includes(mimeType as (typeof ACCEPTED_MIME_TYPES)[number])) {
        return NextResponse.json(
          { error: "Unsupported file type. Only .txt and .pdf are accepted." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      extractedText = await extractText(buffer, mimeType);
      title = file.name;
    } else if (pastedText && pastedText.trim().length > 0) {
      extractedText = pastedText.trim();
      title = extractedText.slice(0, 60) + (extractedText.length > 60 ? "…" : "");
    } else {
      return NextResponse.json(
        { error: "Provide a file or paste text to summarize." },
        { status: 400 }
      );
    }

    if (extractedText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be at least ${MIN_TEXT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (extractedText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be at most ${MAX_TEXT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const output = await summarizeText(extractedText);

    const saved = await insertSummary({
      userId: user.id,
      title,
      originalInput: extractedText,
      summary: output.summary,
      bulletPoints: output.bulletPoints,
      actionItems: output.actionItems,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    if (err instanceof ExtractionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[POST /api/summarize]", err);
    return NextResponse.json(
      { error: "Failed to generate summary. Please try again." },
      { status: 502 }
    );
  }
}
