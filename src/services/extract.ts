import pdfParse from "pdf-parse";

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const result = await pdfParse(buffer);
    return result.text;
  }

  return buffer.toString("utf-8");
}
