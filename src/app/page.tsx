"use client";

import { useState } from "react";
import type { Summary } from "@/db/schema";
import UploadZone from "@/components/UploadZone";
import SummaryResult from "@/components/SummaryResult";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [result, setResult] = useState<Summary | null>(null);

  if (result) {
    return (
      <div className="space-y-6">
        <SummaryResult summary={result} />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setResult(null)}
        >
          Summarize another
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Report Summarizer</h1>
        <p className="text-muted-foreground">
          Upload a report and get a summary, key points, and action items instantly.
        </p>
      </div>
      <div className="w-full max-w-xl">
        <UploadZone onSuccess={setResult} />
      </div>
    </div>
  );
}
