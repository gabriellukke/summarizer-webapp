import { ilike, or, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { summaries, type NewSummary } from "./schema";

export async function insertSummary(data: NewSummary) {
  const [row] = await db.insert(summaries).values(data).returning();
  return row;
}

export async function getSummaries() {
  return db.select().from(summaries).orderBy(desc(summaries.createdAt));
}

export async function deleteSummary(id: number) {
  await db.delete(summaries).where(eq(summaries.id, id));
}

export async function searchSummaries(query: string) {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(summaries)
    .where(
      or(
        ilike(summaries.title, pattern),
        ilike(summaries.summary, pattern),
        ilike(summaries.originalInput, pattern)
      )
    )
    .orderBy(desc(summaries.createdAt));
}
