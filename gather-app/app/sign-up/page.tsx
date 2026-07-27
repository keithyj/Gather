import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { SignInForm } from "@/components/sign-in-form";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SignUpPage() {
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
        <Link href="/sign-in" className="text-sm font-semibold text-ink/65">
          Sign in
        </Link>
      </header>
      <section className="mx-auto max-w-xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">A private account</p>
        <h1 className="mt-3 font-display text-5xl leading-none">Start with a small introduction.</h1>
        <p className="mt-5 max-w-md leading-7 text-ink/65">
          Create an adults-only Gather account. We’ll confirm your email before signing you in.
        </p>
        <SignInForm mode="signUp" />
        <p className="mt-5 text-sm text-ink/65">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-moss underline underline-offset-4">
            Sign in instead
          </Link>
        </p>
      </section>
    </main>
  );
}
