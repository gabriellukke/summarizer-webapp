import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { unauthorizedPayload, authenticatedPayload } from "../setup";

vi.mock("@/lib/supabase/user", () => ({
  getRequiredUser: vi.fn(),
}));

vi.mock("@/db/queries", () => ({
  getSummaries: vi.fn().mockResolvedValue([]),
  searchSummaries: vi.fn().mockResolvedValue([]),
}));

import { GET } from "@/app/api/history/route";
import { getRequiredUser } from "@/lib/supabase/user";
import { getSummaries, searchSummaries } from "@/db/queries";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/history", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(unauthorizedPayload());

    const req = new NextRequest("http://localhost/api/history");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized.");
  });

  it("calls searchSummaries when query param is provided", async () => {
    vi.mocked(getRequiredUser).mockResolvedValue(authenticatedPayload("user-123"));

    const req = new NextRequest("http://localhost/api/history?q=report");
    await GET(req);

    expect(vi.mocked(searchSummaries)).toHaveBeenCalledWith("report", "user-123");
    expect(vi.mocked(getSummaries)).not.toHaveBeenCalled();
  });
});
