"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Mode = "sign-in" | "sign-up" | "forgot-password";

function AuthForm({
  mode,
  onConfirmation,
  onForgotPassword,
}: {
  mode: Mode;
  onConfirmation: (email: string) => void;
  onForgotPassword: () => void;
}) {
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
      } else if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user?.identities?.length === 0) {
          throw new Error("An account with this email already exists. Please sign in.");
        }
        onConfirmation(email);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?type=recovery`,
        });
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
      {mode !== "forgot-password" && (
        <div className="space-y-1">
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {mode === "sign-in" && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                onClick={onForgotPassword}
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? "Please wait…"
          : mode === "sign-in"
          ? "Sign in"
          : mode === "sign-up"
          ? "Sign up"
          : "Send reset link"}
      </Button>
      {mode === "sign-in" && (
        <>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Separator className="flex-1" />
            <span>or</span>
            <Separator className="flex-1" />
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={handleGitHub}>
            Continue with GitHub
          </Button>
        </>
      )}
    </form>
  );
}

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  if (confirmedEmail) {
    const isReset = mode === "forgot-password";
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isReset
            ? <>We sent a password reset link to <strong>{confirmedEmail}</strong>.</>
            : <>We sent a confirmation link to <strong>{confirmedEmail}</strong>. Click it to activate your account.</>}
        </p>
        <button
          className="text-sm underline underline-offset-4 hover:text-foreground transition-colors text-muted-foreground"
          onClick={() => { setConfirmedEmail(null); setMode("sign-in"); }}
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
          {mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create an account" : "Reset your password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "sign-in"
            ? "Sign in to manage your summaries"
            : mode === "sign-up"
            ? "Sign up to get started"
            : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      <AuthForm
        key={mode}
        mode={mode}
        onConfirmation={setConfirmedEmail}
        onForgotPassword={() => setMode("forgot-password")}
      />

      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        {mode === "sign-in" && (
          <p>
            Don&apos;t have an account?{" "}
            <button className="underline underline-offset-4 hover:text-foreground transition-colors" onClick={() => setMode("sign-up")}>
              Sign up
            </button>
          </p>
        )}
        {mode !== "sign-in" && (
          <p>
            Already have an account?{" "}
            <button className="underline underline-offset-4 hover:text-foreground transition-colors" onClick={() => setMode("sign-in")}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
