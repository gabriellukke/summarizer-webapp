"use client";

import { useState } from "react";
import type { Summary } from "@/db/schema";
import SummarizeForm from "@/components/SummarizeForm";
import SummaryResult from "@/components/SummaryResult";
import HistoryPanel from "@/components/HistoryPanel";

export default function Home() {
  const [result, setResult] = useState<Summary | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  function handleSuccess(summary: Summary) {
    setResult(summary);
    setHistoryKey((k) => k + 1);
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Report Summarizer</h1>
      <SummarizeForm onSuccess={handleSuccess} />
      {result && <SummaryResult summary={result} />}
      <HistoryPanel key={historyKey} />
    </div>
  );
}
