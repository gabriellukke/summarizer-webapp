import { getSummaries } from "@/db/queries";
import HistoryPanel from "@/components/HistoryPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "History — Summarizer" };

export default async function HistoryPage() {
  const summaries = await getSummaries();
  return <HistoryPanel initialData={summaries} />;
}
