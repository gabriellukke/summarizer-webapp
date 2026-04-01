"use client";

import { useState, useEffect, useCallback } from "react";
import type { Summary } from "@/db/schema";
import { getHistory, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import SummaryResult from "./SummaryResult";

export default function HistoryPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(q);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory("");
  }, [fetchHistory]);

  useEffect(() => {
    const timer = setTimeout(() => fetchHistory(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchHistory]);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">History</h2>

      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search summaries…"
      />

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No summaries yet.</p>
      )}

      <div className="space-y-4">
        {results.map((s) => (
          <SummaryResult key={s.id} summary={s} />
        ))}
      </div>
    </section>
  );
}
