import Link from "next/link";
import { Brand } from "@/components/brand";
import { EventForm } from "@/components/event-form";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <Link
          href="/"
          className="text-sm font-semibold text-ink/65 hover:text-ink focus:outline-none focus:ring-2 focus:ring-clay"
        >
          Exit setup
        </Link>
      </header>
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-7 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Housewarming template</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-none sm:text-6xl">
          Start with a good welcome.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-7 text-ink/65">
          A calm first draft for a private dinner. You can shape the invitation before anyone sees it.
        </p>
        <div className="mt-10">
          <EventForm />
        </div>
      </div>
    </main>
  );
}
