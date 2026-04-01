import type { Summary } from "@/db/schema";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error ?? "Something went wrong.", res.status);
  return data as T;
}

export async function summarize(formData: FormData): Promise<Summary> {
  const res = await fetch("/api/summarize", { method: "POST", body: formData });
  return handleResponse<Summary>(res);
}

export async function getHistory(query?: string): Promise<Summary[]> {
  const url = query?.trim()
    ? `/api/history?q=${encodeURIComponent(query)}`
    : "/api/history";
  const res = await fetch(url);
  return handleResponse<Summary[]>(res);
}

export async function deleteSummary(id: number): Promise<void> {
  const res = await fetch(`/api/summaries/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new ApiError(data.error ?? "Failed to delete.", res.status);
  }
}
