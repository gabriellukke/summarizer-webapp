"use client";

import { useState, useEffect, useCallback } from "react";
import type { Summary } from "@/db/schema";
import { getHistory, deleteSummary, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import SummaryResult from "./SummaryResult";

interface Props {
  initialData: Summary[];
}

export default function HistoryPanel({ initialData }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Summary[]>(initialData);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (q: string) => {
    setSearching(true);
    setError(null);
    try {
      const data = await getHistory(q);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load history");
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchHistory(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchHistory]);

  async function handleDelete(id: number) {
    try {
      await deleteSummary(id);
      setResults((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete summary.");
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">History</h2>

      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search summaries…"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!searching && !error && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No summaries yet.</p>
      )}

      <div className="space-y-4">
        {results.map((s) => (
          <SummaryResult key={s.id} summary={s} onDelete={handleDelete} />
        ))}
      </div>
    </section>
  );
}
