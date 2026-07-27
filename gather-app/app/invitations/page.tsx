import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { isSupabaseConfigured } from "@/lib/env";
import { getMyInvitationViews } from "@/lib/event-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvitationsPage() {
  if (!isSupabaseConfigured()) redirect("/sign-in");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/invitations");
  const invitations = await getMyInvitationViews();
  return (
    <main className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Brand />
        <Link href="/account" className="text-sm font-semibold text-ink/65">
          Your account
        </Link>
      </header>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Your invitations</p>
        <h1 className="mt-3 font-display text-5xl leading-none">Plans waiting for you.</h1>
        <div className="mt-8 space-y-3">
          {invitations.length ? (
            invitations.map((invitation) => (
              <Link
                key={invitation.id}
                href={`/invitations/${invitation.id}`}
                className="block rounded-2xl border border-ink/10 bg-white p-5 shadow-sm transition hover:border-moss/30"
              >
                <p className="text-sm font-semibold text-moss">{invitation.status}</p>
                <h2 className="mt-2 text-xl font-semibold">{invitation.event.title}</h2>
                <p className="mt-1 text-sm text-ink/65">
                  {invitation.event.broadArea} ·{" "}
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(invitation.event.startsAt)
                  )}
                </p>
              </Link>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-ink/20 p-5 text-sm text-ink/60">
              No private invitations yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
