import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  originalInput: text("original_input").notNull(),
  summary: text("summary").notNull(),
  bulletPoints: jsonb("bullet_points").notNull().$type<string[]>(),
  actionItems: jsonb("action_items").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
