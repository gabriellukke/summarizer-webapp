import pdfParse from "pdf-parse";

export class ExtractionError extends Error {}

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      const result = await pdfParse(buffer);
      return result.text;
    } catch {
      throw new ExtractionError("Could not read the PDF. The file may be corrupted or password-protected.");
    }
  }

  return buffer.toString("utf-8");
}
