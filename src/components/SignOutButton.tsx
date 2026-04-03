"use client";

import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}
