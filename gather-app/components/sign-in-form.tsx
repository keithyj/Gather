"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPasswordAction } from "@/lib/actions/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthMode = "signIn" | "signUp";

export function SignInForm({ next, mode = "signIn" }: { next?: string; mode?: AuthMode }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    const identifier = String(formData.get("identifier") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const username = String(formData.get("username") ?? "")
      .trim()
      .toLowerCase();
    const displayName = String(formData.get("displayName") ?? "").trim();

    if (mode === "signIn") {
      if (!identifier || !password) {
        setMessage("Enter your email or username and password.");
        return;
      }
      setPending(true);
      setMessage(undefined);
      const result = await signInWithPasswordAction({ identifier, password });
      setPending(false);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      router.replace(next ?? "/dashboard");
      router.refresh();
      return;
    }

    if (!email) {
      setMessage("Enter a valid email address.");
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      setMessage("Use 3–24 lowercase letters, numbers, or underscores for your username.");
      return;
    }
    if (!displayName) {
      setMessage("Add the name your friends know you by.");
      return;
    }
    if (password.length < 10) {
      setMessage("Choose a password with at least 10 characters.");
      return;
    }

    setPending(true);
    setMessage(undefined);
    try {
      const supabase = createBrowserSupabaseClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (next) callbackUrl.searchParams.set("next", next);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          data: { username, display_name: displayName }
        }
      });
      setMessage(
        error
          ? "We couldn’t create that account. Try another username or sign in if you already have an account."
          : "Check your email to confirm your account."
      );
    } catch {
      setMessage("Account creation is unavailable until Supabase is configured.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="mt-8 space-y-4" aria-describedby="auth-status">
      {mode === "signUp" ? (
        <>
          <div>
            <label htmlFor="displayName" className="text-sm font-semibold text-ink">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              maxLength={80}
              autoComplete="name"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
              placeholder="How friends know you"
            />
          </div>
          <div>
            <label htmlFor="username" className="text-sm font-semibold text-ink">
              Username
            </label>
            <input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]+"
              autoCapitalize="none"
              autoComplete="username"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
              placeholder="e.g. maya_s"
            />
            <p className="mt-1 text-xs text-ink/55">
              3–24 letters, numbers, or underscores. It must be unique.
            </p>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-ink">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
              placeholder="you@example.com"
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="identifier" className="text-sm font-semibold text-ink">
            Email address or username
          </label>
          <input
            id="identifier"
            name="identifier"
            required
            autoCapitalize="none"
            autoComplete="username"
            className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
            placeholder="you@example.com or maya_s"
          />
        </div>
      )}
      <div>
        <label htmlFor="password" className="text-sm font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          maxLength={128}
          autoComplete={mode === "signUp" ? "new-password" : "current-password"}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          placeholder={mode === "signUp" ? "At least 10 characters" : "Your password"}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-full bg-ink px-5 py-3 font-semibold text-paper hover:bg-moss disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2"
      >
        {pending ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"}
      </button>
      <p
        id="auth-status"
        aria-live="polite"
        className={message?.startsWith("Check") ? "text-sm text-moss" : "text-sm font-medium text-[#a43d2a]"}
      >
        {message}
      </p>
      {mode === "signIn" && (
        <p className="text-sm text-ink/65">
          No account yet?{" "}
          <Link href="/sign-up" className="font-semibold text-moss underline underline-offset-4">
            Create one
          </Link>
        </p>
      )}
      <p className="text-xs leading-5 text-ink/55">
        Gather is for adults aged 18 and over. Email verification helps reduce impersonation but does not
        guarantee identity or safety.
      </p>
    </form>
  );
}
