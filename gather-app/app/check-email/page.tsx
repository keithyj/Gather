import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckEmailPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) redirect("/account");
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-xl items-center justify-between px-5 py-5">
        <Brand />
        <Link href="/" className="text-sm font-semibold text-ink/65">
          Back home
        </Link>
      </header>
      <section className="mx-auto max-w-xl px-5 py-12 sm:py-16">
        <div className="rounded-3xl border border-moss/20 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">One quick check</p>
          <h1 className="mt-3 font-display text-5xl leading-none">Check your email.</h1>
          <p className="mt-5 leading-7 text-ink/65">
            If this is a new account, Supabase has sent a confirmation link. Open it in this same browser and
            on this same Gather address; we’ll finish signing you in automatically.
          </p>
          <div className="mt-6 rounded-2xl bg-mist/60 p-4 text-sm leading-6 text-ink/70">
            <p className="font-semibold text-ink">Nothing after a few minutes?</p>
            <p className="mt-1">
              Check spam first. If you have used this email before, try signing in instead. Repeated
              confirmation requests may also be temporarily rate-limited.
            </p>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-3 font-semibold text-paper hover:bg-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2"
            >
              Go to sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 bg-white px-5 py-3 font-semibold text-ink hover:border-ink/35 focus:outline-none focus:ring-2 focus:ring-clay"
            >
              Use a different email
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
