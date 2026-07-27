import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) redirect("/sign-in");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/dashboard");
  const { data: events } = await supabase
    .from("events")
    .select("id, title, broad_area, starts_at, status")
    .eq("host_user_id", user.id)
    .order("starts_at", { ascending: true });
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Your Gather</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl leading-none">Host with a little more ease.</h1>
          <Link href="/create" className="min-h-11 rounded-full bg-ink px-5 py-3 font-semibold text-paper">
            Create gathering
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-ink/10 bg-white p-5">
            <h2 className="font-display text-3xl">Hosting</h2>
            <div className="mt-4 space-y-3">
              {events?.length ? (
                events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/host/events/${event.id}`}
                    className="block rounded-2xl border border-ink/10 p-4 hover:border-moss/35"
                  >
                    <p className="text-sm font-semibold text-moss">{event.status}</p>
                    <h3 className="mt-1 font-semibold">{event.title}</h3>
                    <p className="mt-1 text-sm text-ink/60">{event.broad_area}</p>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-ink/20 p-4 text-sm text-ink/60">
                  Your hosted gatherings will appear here.
                </p>
              )}
            </div>
          </section>
          <aside className="rounded-3xl bg-mist/60 p-5">
            <h2 className="font-display text-3xl">Coming as a guest?</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">
              Private invitations stay in your Gather inbox until you respond.
            </p>
            <Link
              href="/invitations"
              className="mt-5 inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold"
            >
              Open invitations
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
