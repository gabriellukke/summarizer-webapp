import { z } from "zod";

export const ACCEPTED_MIME_TYPES = ["text/plain", "application/pdf"] as const;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MIN_TEXT_LENGTH = 20;
export const MAX_TEXT_LENGTH = 10_000;

export const SummarizeTextSchema = z.object({
  text: z
    .string()
    .min(MIN_TEXT_LENGTH, `Text must be at least ${MIN_TEXT_LENGTH} characters`)
    .max(MAX_TEXT_LENGTH, `Text must be at most ${MAX_TEXT_LENGTH} characters`),
  title: z.string().min(1),
});

export const SearchSchema = z.object({
  q: z.string().min(1).max(200),
});
