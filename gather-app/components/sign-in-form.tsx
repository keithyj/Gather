"use client";

import { useActionState } from "react";
import { requestMagicLinkAction } from "@/lib/actions/auth";

export function SignInForm() {
  const [state, action, pending] = useActionState(requestMagicLinkAction, {});
  return (
    <form action={action} className="mt-8 space-y-4" aria-describedby="sign-in-status">
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
        className={state.error ? "text-sm font-medium text-[#a43d2a]" : "text-sm text-moss"}
      >
        {state.error || state.success}
      </p>
      <p className="text-xs leading-5 text-ink/55">
        Gather is for adults aged 18 and over. Email verification helps reduce impersonation but does not
        guarantee identity or safety.
      </p>
    </form>
  );
}
