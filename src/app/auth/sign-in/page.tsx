"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Mode = "sign-in" | "sign-up";

function AuthForm({ mode, onConfirmation }: { mode: Mode; onConfirmation: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onConfirmation(email);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHub() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Sign up"}
      </Button>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        <span>or</span>
        <Separator className="flex-1" />
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={handleGitHub}>
        Continue with GitHub
      </Button>
    </form>
  );
}

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  if (confirmedEmail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          We sent a confirmation link to <strong>{confirmedEmail}</strong>. Click it to activate your account.
        </p>
        <button
          className="text-sm underline underline-offset-4 hover:text-foreground transition-colors text-muted-foreground"
          onClick={() => setConfirmedEmail(null)}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Sign in" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "sign-in" ? "Sign in to manage your summaries" : "Sign up to get started"}
        </p>
      </div>

      <AuthForm key={mode} mode={mode} onConfirmation={setConfirmedEmail} />

      <p className="text-sm text-muted-foreground">
        {mode === "sign-in" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          className="underline underline-offset-4 hover:text-foreground transition-colors"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode === "sign-in" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
