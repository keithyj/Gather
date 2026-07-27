import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { HostGuestManager } from "@/components/host-guest-manager";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HostEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  if (!isSupabaseConfigured())
    return (
      <main className="grid min-h-screen place-items-center bg-paper p-5">
        <div className="max-w-md rounded-3xl border border-clay/25 bg-white p-6">
          <h1 className="font-display text-3xl">Guest management is unavailable</h1>
          <p className="mt-3 leading-6 text-ink/65">
            Configure Supabase before managing a private guest list.
          </p>
        </div>
      </main>
    );
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/host/events/${eventId}`);
  const { data: event } = await supabase
    .from("events")
    .select("id, host_user_id, title, broad_area, starts_at, capacity")
    .eq("id", eventId)
    .maybeSingle();
  if (!event || event.host_user_id !== user.id) notFound();
  const { data: membershipRows } = await supabase
    .from("event_memberships")
    .select("id, user_id, role, approval_status")
    .eq("event_id", eventId)
    .neq("role", "host");
  const { data: invitationRows } = await supabase
    .from("invitations")
    .select("id, invitee_user_id, status")
    .eq("event_id", eventId);
  const { data: plusOneRows } = await supabase
    .from("plus_one_requests")
    .select("id, proposed_user_id, status")
    .eq("event_id", eventId);
  const userIds = [
    ...new Set([
      ...(membershipRows ?? []).map((row) => row.user_id),
      ...(plusOneRows ?? []).map((row) => row.proposed_user_id)
    ])
  ];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [] as { id: string; display_name: string }[] };
  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]));
  const invitationIds = new Map(
    (invitationRows ?? [])
      .filter((invitation) => invitation.status === "accepted")
      .map((invitation) => [invitation.invitee_user_id, invitation.id])
  );
  const memberships = (membershipRows ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    label: names.get(row.user_id) ?? "Private guest",
    status: row.approval_status,
    role: row.role,
    invitationId: invitationIds.get(row.user_id)
  }));
  const plusOnes = (plusOneRows ?? []).map((row) => ({
    id: row.id,
    label: names.get(row.proposed_user_id) ?? "Private guest",
    status: row.status
  }));
  return (
    <main className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <Link href="/create" className="text-sm font-semibold text-ink/65">
          Create another
        </Link>
      </header>
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Host guest list</p>
        <h1 className="mt-3 font-display text-5xl leading-none">{event.title}</h1>
        <p className="mt-4 text-ink/65">
          {event.broad_area} ·{" "}
          {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(event.starts_at)
          )}{" "}
          · {event.capacity} places
        </p>
        <p className="mt-6 rounded-2xl border border-moss/15 bg-mist/50 p-4 text-sm leading-6 text-ink/70">
          Exact location details are deliberately not shown on this management screen. Approval changes take
          effect at the database policy level immediately.
        </p>
        <div className="mt-8">
          <HostGuestManager eventId={eventId} memberships={memberships} plusOnes={plusOnes} />
        </div>
      </section>
    </main>
  );
}
