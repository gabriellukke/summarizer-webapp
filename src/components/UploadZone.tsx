"use client";

import { useState, useRef, useCallback } from "react";
import type { Summary } from "@/db/schema";
import { summarize, ApiError } from "@/lib/api";
import { MAX_FILE_SIZE_BYTES } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  onSuccess: (summary: Summary) => void;
}

export default function UploadZone({ onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const handleFile = useCallback((f: File) => {
    if (f.size > MAX_FILE_SIZE_BYTES) {
      setError("File exceeds 4MB limit.");
      return;
    }
    setError(null);
    setText("");
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }

      const result = await summarize(formData);
      onSuccess(result);
      setFile(null);
      setText("");
      setShowPaste(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Network error. Please try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  const hasInput = file !== null || text.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 cursor-pointer transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        )}
      >
        <div className="relative">
          <div className="flex h-16 w-12 flex-col rounded-md border-2 border-muted-foreground/30 bg-muted items-center justify-center">
            <div className="absolute -top-1 -right-1 rounded-sm bg-muted-foreground/20 px-1 text-[10px] font-bold text-muted-foreground">
              PDF
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm">
            <span className="font-medium text-primary cursor-pointer">Click to upload</span>
            <span className="text-muted-foreground"> or drag and drop</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">PDF or TXT — max 4MB</p>
        </div>

        {file && (
          <div className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {file.name}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".txt,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        <button
          type="button"
          onClick={() => { setShowPaste((v) => !v); setFile(null); }}
          className="shrink-0 hover:text-foreground transition-colors"
        >
          {showPaste ? "hide text input" : "or paste text"}
        </button>
        <Separator className="flex-1" />
      </div>

      {showPaste && (
        <Textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setFile(null); }}
          placeholder="Paste your report here..."
          rows={8}
          autoFocus
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading || !hasInput}
        className="w-full"
        suppressHydrationWarning
      >
        {loading ? "Summarizing…" : "Summarize"}
      </Button>
    </form>
  );
}
