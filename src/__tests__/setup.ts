import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export const unauthorizedPayload = () => ({
  user: null,
  unauthorized: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
});

export const authenticatedPayload = (id = "user-123") => ({
  user: {
    id,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User,
  unauthorized: null,
});
