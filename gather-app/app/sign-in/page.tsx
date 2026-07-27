import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignInForm } from "@/components/sign-in-form";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeNext(next: string | undefined) {
  if (!next) return "/account";
  const base = "https://gather.invalid";
  const destination = new URL(next, base);
  return destination.origin === base
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : "/account";
}

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const parameters = await searchParams;
  const next = safeNext(parameters.next);
  const confirmationProblem =
    parameters.error === "link_unavailable"
      ? "We couldn’t finish email confirmation in this browser. Open a fresh confirmation email in the same browser and on the same Gather address where you created your account."
      : parameters.error === "missing_code"
        ? "That confirmation link is incomplete. Request a fresh confirmation email from the same browser where you created your account."
        : undefined;
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) redirect(next);
  }
  return (
    <main className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-xl items-center justify-between px-5 py-5">
        <Brand />
        <Link href="/" className="text-sm font-semibold text-ink/65">
          Back home
        </Link>
      </header>
      <section className="mx-auto max-w-xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Private by default</p>
        <h1 className="mt-3 font-display text-5xl leading-none">A simple, safer way in.</h1>
        <p className="mt-5 max-w-md leading-7 text-ink/65">
          Sign in with your email address or username and your password.
        </p>
        {confirmationProblem && (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-clay/25 bg-clay/10 p-4 text-sm leading-6 text-ink"
          >
            {confirmationProblem}
          </p>
        )}
        <SignInForm next={next === "/account" ? undefined : next} />
      </section>
    </main>
  );
}
