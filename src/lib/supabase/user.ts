import { cache } from "react";
import { NextResponse } from "next/server";
import { createClient } from "./server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

/**
 * For use in API route handlers. Returns the authenticated user or a 401
 * NextResponse that the caller should return immediately.
 */
export async function getRequiredUser(): Promise<
  | { user: NonNullable<Awaited<ReturnType<typeof getUser>>>; unauthorized: null }
  | { user: null; unauthorized: NextResponse }
> {
  const user = await getUser();
  if (!user) {
    return {
      user: null,
      unauthorized: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { user, unauthorized: null };
}
