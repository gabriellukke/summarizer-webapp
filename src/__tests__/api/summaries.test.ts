import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { unauthorizedPayload, authenticatedPayload } from "../setup";

vi.mock("@/lib/supabase/user", () => ({
  getRequiredUser: vi.fn(),
}));

vi.mock("@/db/queries", () => ({
  deleteSummary: vi.fn().mockResolvedValue(undefined),
}));

import { DELETE } from "@/app/api/summaries/[id]/route";
import { getRequiredUser } from "@/lib/supabase/user";
import { deleteSummary } from "@/db/queries";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/summaries/:id", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(unauthorizedPayload());

    const req = new NextRequest("http://localhost/api/summaries/1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized.");
  });

  it("scopes delete to the authenticated user — prevents IDOR", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(authenticatedPayload("user-abc"));

    const req = new NextRequest("http://localhost/api/summaries/42", { method: "DELETE" });
    await DELETE(req, { params: Promise.resolve({ id: "42" }) });

    expect(vi.mocked(deleteSummary)).toHaveBeenCalledWith(42, "user-abc");
  });

  it("returns 400 for a non-numeric id", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(authenticatedPayload());

    const req = new NextRequest("http://localhost/api/summaries/abc", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "abc" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid id.");
  });
});
