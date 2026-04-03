import { redirect } from "next/navigation";
import { getSummaries } from "@/db/queries";
import { getUser } from "@/lib/supabase/user";
import HistoryPanel from "@/components/HistoryPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "History — Summarizer" };

export default async function HistoryPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  const summaries = await getSummaries(user.id);
  return <HistoryPanel initialData={summaries} />;
}
