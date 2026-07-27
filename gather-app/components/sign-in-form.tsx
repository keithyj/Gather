"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignInForm() {
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  async function requestMagicLink(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      setMessage("Enter a valid email address.");
      return;
    }
    setPending(true);
    setMessage(undefined);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: new URL("/auth/confirm", window.location.origin).toString() }
      });
      setMessage(
        error
          ? "We couldn’t send that sign-in link. Please try again."
          : "Check your email for a sign-in link."
      );
    } catch {
      setMessage("Sign-in is unavailable until Supabase is configured.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={requestMagicLink} className="mt-8 space-y-4" aria-describedby="sign-in-status">
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
        {pending ? "Sending link…" : "Email me a sign-in link"}
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
