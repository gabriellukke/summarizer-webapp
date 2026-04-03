import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { unauthorizedPayload, authenticatedPayload } from "../setup";

vi.mock("@/lib/supabase/user", () => ({
  getRequiredUser: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
  getRatelimit: vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

vi.mock("@/services/summarize", () => ({
  summarizeText: vi.fn(),
}));

vi.mock("@/services/extract", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/extract")>();
  return { ...actual, extractText: vi.fn() };
});

vi.mock("@/db/queries", () => ({
  insertSummary: vi.fn(),
}));

import { POST } from "@/app/api/summarize/route";
import { getRequiredUser } from "@/lib/supabase/user";
import { getRatelimit } from "@/lib/ratelimit";
import { summarizeText } from "@/services/summarize";
import { insertSummary } from "@/db/queries";

const mockSummaryOutput = {
  summary: "A short summary.",
  bulletPoints: ["Point one", "Point two"],
  actionItems: ["Action one"],
};

const mockSavedSummary = {
  id: 1,
  userId: "user-123",
  title: "Some text to summarize",
  originalInput: "Some text to summarize",
  ...mockSummaryOutput,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/summarize", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(unauthorizedPayload());

    const formData = new FormData();
    formData.append("text", "some text to summarize");
    const req = new NextRequest("http://localhost/api/summarize", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized.");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(authenticatedPayload());
    vi.mocked(getRatelimit).mockReturnValue({
      limit: vi.fn().mockResolvedValue({ success: false }),
    } as unknown as ReturnType<typeof getRatelimit>);

    const formData = new FormData();
    formData.append("text", "some text to summarize");
    const req = new NextRequest("http://localhost/api/summarize", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe("Too many requests. Please wait a moment.");
  });

  it("returns 201 with the saved summary on success", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(authenticatedPayload("user-123"));
    vi.mocked(getRatelimit).mockReturnValue({
      limit: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as ReturnType<typeof getRatelimit>);
    vi.mocked(summarizeText).mockResolvedValue(mockSummaryOutput);
    vi.mocked(insertSummary).mockResolvedValue(mockSavedSummary);

    const formData = new FormData();
    formData.append("text", "Some text to summarize");
    const req = new NextRequest("http://localhost/api/summarize", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(vi.mocked(insertSummary)).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-123" })
    );
  });
});
