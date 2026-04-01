import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI();

const SummaryOutputSchema = z.object({
  summary: z.string(),
  bulletPoints: z.array(z.string()),
  actionItems: z.array(z.string()),
});

export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

const SYSTEM_PROMPT = `You are a document summarizer. Given a report or text, respond ONLY with valid JSON matching this exact schema:
{
  "summary": "A concise paragraph summarizing the main points",
  "bulletPoints": ["Key point 1", "Key point 2", "..."],
  "actionItems": ["Actionable task 1", "Actionable task 2", "..."]
}
Do not include any text outside the JSON object.`;

export async function summarizeText(text: string): Promise<SummaryOutput> {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from LLM");

  const parsed = JSON.parse(raw);
  const result = SummaryOutputSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`Invalid LLM response structure: ${result.error.message}`);
  }

  return result.data;
}
