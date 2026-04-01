import { extractText as pdfExtractText } from "unpdf";

export class ExtractionError extends Error {}

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      const { text } = await pdfExtractText(new Uint8Array(buffer));
      return text.join("\n");
    } catch {
      throw new ExtractionError("Could not read the PDF. The file may be corrupted or password-protected.");
    }
  }

  return buffer.toString("utf-8");
}
