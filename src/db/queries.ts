import { ilike, or, desc, eq, and } from "drizzle-orm";
import { db } from "./client";
import { summaries, type NewSummary } from "./schema";

export async function insertSummary(data: NewSummary) {
  const [row] = await db.insert(summaries).values(data).returning();
  return row;
}

export async function getSummaries(userId: string) {
  return db
    .select()
    .from(summaries)
    .where(eq(summaries.userId, userId))
    .orderBy(desc(summaries.createdAt));
}

export async function deleteSummary(id: number, userId: string) {
  await db.delete(summaries).where(and(eq(summaries.id, id), eq(summaries.userId, userId)));
}

export async function searchSummaries(query: string, userId: string) {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(summaries)
    .where(
      and(
        eq(summaries.userId, userId),
        or(
          ilike(summaries.title, pattern),
          ilike(summaries.summary, pattern),
          ilike(summaries.originalInput, pattern)
        )
      )
    )
    .orderBy(desc(summaries.createdAt));
}
