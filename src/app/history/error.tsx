"use client";

export default function HistoryError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">History</h2>
      <p className="text-sm text-destructive">{error.message}</p>
      <button
        className="text-sm underline underline-offset-4"
        onClick={reset}
      >
        Try again
      </button>
    </section>
  );
}
