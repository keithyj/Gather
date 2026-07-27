import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
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
          Use your email to receive a secure sign-in link. We’ll create a minimal profile after you verify it.
        </p>
        <SignInForm />
      </section>
    </main>
  );
}
