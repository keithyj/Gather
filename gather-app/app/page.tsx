import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const steps = ["Choose the feeling", "Invite thoughtfully", "Unlock details after approval"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-24 lg:pt-16">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-moss/20 bg-white px-3 py-1.5 text-sm font-medium text-moss">
            Private gatherings, thoughtfully held
          </p>
          <h1 className="max-w-xl font-display text-5xl leading-[.95] tracking-tight text-ink sm:text-7xl">
            Bring people together. Keep the important bits close.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-ink/70">
            Gather lets you create an intimate event, approve each place, and share your home details only
            when it feels right.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded-full bg-clay px-5 py-3 font-semibold text-white shadow-card transition hover:bg-[#bd593e] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
            >
              Plan a housewarming
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-ink/15 bg-white px-5 py-3 font-semibold text-ink hover:border-ink/35 focus:outline-none focus:ring-2 focus:ring-clay"
            >
              How it works
            </a>
          </div>
          <p className="mt-5 text-sm text-ink/55">
            For adults-only, invite-led gatherings. Never public by default.
          </p>
        </div>
        <div
          aria-label="Example private event card"
          className="relative mx-auto w-full max-w-md rounded-[2rem] bg-moss p-4 shadow-card"
        >
          <div
            className="absolute -right-10 -top-10 size-36 rounded-full bg-clay/70 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative rounded-[1.45rem] bg-paper p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="rounded-full bg-mist px-3 py-1 font-medium text-moss">
                Housewarming dinner
              </span>
              <span className="text-ink/55">14 places</span>
            </div>
            <h2 className="mt-8 font-display text-4xl leading-none">
              New keys,
              <br />
              old friends.
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">When</p>
                <p className="mt-1 font-semibold">Sat, 12 Sep · 7pm</p>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Where</p>
                <p className="mt-1 font-semibold">Hackney, London</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-moss/30 bg-mist/60 p-4">
              <p className="text-sm font-semibold text-moss">Exact address locked</p>
              <p className="mt-1 text-sm leading-5 text-ink/65">
                Shared only after Maya approves your place.
              </p>
            </div>
            <div className="paper-grain mt-5 rotate-[-2deg] rounded-sm bg-[#f0e7d2] p-3 shadow-paper">
              <div className="h-20 rounded-sm bg-gradient-to-br from-[#e3a679] via-[#d5d6a4] to-[#6b9889]" />
              <p className="pt-2 font-display text-sm">A place to remember</p>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="soft-grid border-y border-moss/10 bg-mist/35 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">
            Made for a good kind of night
          </p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step} className="rounded-3xl border border-moss/10 bg-paper p-6">
                <span className="grid size-9 place-items-center rounded-full bg-moss text-sm font-semibold text-white">
                  0{index + 1}
                </span>
                <h2 className="mt-8 text-xl font-semibold">{step}</h2>
                <p className="mt-2 leading-6 text-ink/65">
                  {index === 0
                    ? "Share a warm preview and the broad area, not your front door."
                    : index === 1
                      ? "Guests can respond, and plus-ones stay a request—not an assumption."
                      : "Approved guests see the details they need, at the right moment."}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
