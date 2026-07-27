"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignInForm({ next, mode = "signIn" }: { next?: string; mode?: "signIn" | "signUp" }) {
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function requestMagicLink(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "")
      .trim()
      .toLowerCase();
    const displayName = String(formData.get("displayName") ?? "").trim();
    if (!email) {
      setMessage("Enter a valid email address.");
      return;
    }
    if (mode === "signUp" && !/^[a-z0-9_]{3,24}$/.test(username)) {
      setMessage("Use 3–24 lowercase letters, numbers, or underscores for your username.");
      return;
    }
    if (mode === "signUp" && !displayName) {
      setMessage("Add the name your friends know you by.");
      return;
    }
    setPending(true);
    setMessage(undefined);
    try {
      const supabase = createBrowserSupabaseClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (next) callbackUrl.searchParams.set("next", next);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          shouldCreateUser: mode === "signUp",
          data: mode === "signUp" ? { username, display_name: displayName } : undefined
        }
      });
      setMessage(
        error
          ? mode === "signIn"
            ? "We couldn’t find that account. Create one first, or check the email address."
            : "We couldn’t create that account. Try another username or email."
          : mode === "signIn"
            ? "Check your email for a sign-in link."
            : "Check your email to confirm your new account."
      );
    } catch {
      setMessage("Sign-in is unavailable until Supabase is configured.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={requestMagicLink} className="mt-8 space-y-4" aria-describedby="sign-in-status">
      {mode === "signUp" && (
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
              className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 shadow-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
              placeholder="e.g. maya_s"
            />
            <p className="mt-1 text-xs text-ink/55">
              3–24 letters, numbers, or underscores. It must be unique.
            </p>
          </div>
        </>
      )}
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
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-full bg-ink px-5 py-3 font-semibold text-paper hover:bg-moss disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2"
      >
        {pending
          ? "Sending link…"
          : mode === "signIn"
            ? "Email me a sign-in link"
            : "Create account with email"}
      </button>
      <p
        id="sign-in-status"
        aria-live="polite"
        className={message?.startsWith("Check") ? "text-sm text-moss" : "text-sm font-medium text-[#a43d2a]"}
      >
        {message}
      </p>
      <p className="text-xs leading-5 text-ink/55">
        Gather is for adults aged 18 and over. Email verification helps reduce impersonation but does not
        guarantee identity or safety.
      </p>
    </form>
  );
}
