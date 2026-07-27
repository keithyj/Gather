import Link from "next/link";
import { Brand } from "@/components/brand";

type SearchParams = Promise<{
  title?: string;
  area?: string;
  date?: string;
  time?: string;
  description?: string;
  capacity?: string;
  policy?: string;
}>;
function humanDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(
        new Date(`${value}T12:00:00`)
      )
    : "Saturday, 12 September";
}

export default async function PreviewPage({ searchParams }: { searchParams: SearchParams }) {
  const data = await searchParams;
  const title = data.title || "New keys, old friends";
  const area = data.area || "Hackney, East London";
  const time = data.time || "19:00";
  const [hour, minute] = time.split(":");
  const formattedTime = `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? "pm" : "am"}`;
  return (
    <main className="min-h-screen bg-moss px-5 py-5 sm:px-8">
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <Brand />
        <Link
          href="/create"
          className="rounded-full border border-paper/35 px-4 py-2 text-sm font-semibold text-paper hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-paper"
        >
          Back to edit
        </Link>
      </header>
      <section className="mx-auto grid max-w-4xl gap-8 py-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <div className="text-paper">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-paper/65">
            Private invitation preview
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[.95] sm:text-6xl">
            This is what guests see before approval.
          </h1>
          <p className="mt-5 max-w-md leading-7 text-paper/75">
            The preview includes a little atmosphere and enough context to respond—never a front door, arrival
            instructions, or guest list.
          </p>
          <div className="mt-8 rounded-2xl border border-paper/15 bg-paper/10 p-4 text-sm leading-6">
            <strong>Prototype boundary:</strong> no event was created. This route contains only safe preview
            fields. Authorised details require server-side checks and RLS before launch.
          </div>
        </div>
        <article className="lift rounded-[1.8rem] bg-paper p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-moss">
              Housewarming dinner
            </span>
            <span className="text-sm text-ink/55">Maya is hosting</span>
          </div>
          <h2 className="mt-9 font-display text-4xl leading-none">{title}</h2>
          <p className="mt-4 leading-7 text-ink/65">
            {data.description || "A slow dinner, a few new introductions, and a toast to this little place."}
          </p>
          <dl className="mt-8 grid gap-3">
            <div className="rounded-2xl bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">When</dt>
              <dd className="mt-1 font-semibold">
                {humanDate(data.date)} · {formattedTime}
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Broad area</dt>
              <dd className="mt-1 font-semibold">{area}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl border border-dashed border-moss/30 bg-mist/70 p-4">
            <p className="flex items-center gap-2 font-semibold text-moss">
              <span aria-hidden="true">⌁</span> Exact address locked
            </p>
            <p className="mt-1 text-sm leading-5 text-ink/65">
              The exact address is shared only after the host approves your place.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between text-sm text-ink/60">
            <span>Up to {data.capacity || "14"} places</span>
            <span>{data.policy === "none" ? "No plus-ones" : "Plus-ones by request"}</span>
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-ink px-5 py-3 font-semibold text-paper"
          >
            Request to join
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-ink/50">
            A live RSVP is not available in this prototype.
          </p>
        </article>
      </section>
    </main>
  );
}
