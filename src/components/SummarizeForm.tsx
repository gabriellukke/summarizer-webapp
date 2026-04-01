"use client";

import { useState, useRef } from "react";
import type { Summary } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface Props {
  onSuccess: (summary: Summary) => void;
}

export default function SummarizeForm({ onSuccess }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }

      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      onSuccess(data as Summary);
      setText("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Upload a report <span className="text-muted-foreground font-normal">(.txt or .pdf)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.pdf"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setText("");
          }}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
        />
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        or paste text
        <Separator className="flex-1" />
      </div>

      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setFile(null);
          if (fileRef.current) fileRef.current.value = "";
        }}
        placeholder="Paste your report here..."
        rows={8}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading || (!file && text.trim().length === 0)}
        suppressHydrationWarning
      >
        {loading ? "Summarizing…" : "Summarize"}
      </Button>
    </form>
  );
}
