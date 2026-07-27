"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      setMessage("This sign-in link is unavailable. Request a new one.");
      return;
    }
    createBrowserSupabaseClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error)
          setMessage(
            "This sign-in link is unavailable. Request a fresh link and open it in the same browser."
          );
        else router.replace("/account");
      });
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-5">
      <p className="rounded-2xl bg-white p-5 text-sm text-ink/70" aria-live="polite">
        {message}
      </p>
    </main>
  );
}
