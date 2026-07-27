import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { InvitationResponse } from "@/components/invitation-response";
import { PlusOneRequestForm } from "@/components/plus-one-request-form";
import { isSupabaseConfigured } from "@/lib/env";
import { getInvitationView } from "@/lib/event-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvitationPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  if (!isSupabaseConfigured())
    return (
      <main className="grid min-h-screen place-items-center bg-paper p-5">
        <div className="max-w-md rounded-3xl border border-clay/25 bg-white p-6">
          <h1 className="font-display text-3xl">Invitation unavailable</h1>
          <p className="mt-3 leading-6 text-ink/65">
            Configure Supabase for local development before opening a private invitation.
          </p>
        </div>
      </main>
    );
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/invitations/${invitationId}`);
  const invitation = await getInvitationView(invitationId);
  if (!invitation) notFound();
  const isExpired = new Date(invitation.expiresAt) <= new Date();
  const isCancelled = invitation.event.status === "cancelled";
  const canRespond = invitation.status === "pending" && !isExpired && !isCancelled;
  return (
    <main className="min-h-screen bg-moss px-5 py-5 sm:px-8">
      <header className="mx-auto flex max-w-2xl items-center justify-between">
        <Brand />
        <Link href="/account" className="text-sm font-semibold text-paper">
          Your profile
        </Link>
      </header>
      <section className="mx-auto max-w-2xl py-12">
        <article className="rounded-[1.8rem] bg-paper p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Private invitation</p>
          <h1 className="mt-3 font-display text-5xl leading-none">{invitation.event.title}</h1>
          <p className="mt-5 leading-7 text-ink/65">{invitation.event.description}</p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">When</dt>
              <dd className="mt-1 font-semibold">
                {new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short" }).format(
                  new Date(invitation.event.startsAt)
                )}
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Broad area</dt>
              <dd className="mt-1 font-semibold">{invitation.event.broadArea}</dd>
            </div>
          </dl>
          {isCancelled ? (
            <section className="mt-5 rounded-2xl border border-clay/25 bg-[#fff8f5] p-5">
              <p className="font-semibold text-[#a43d2a]">This gathering has been cancelled.</p>
              <p className="mt-1 text-sm leading-6 text-ink/65">
                Private location details are no longer available.
              </p>
            </section>
          ) : invitation.membershipStatus === "declined" || invitation.membershipStatus === "removed" ? (
            <section className="mt-5 rounded-2xl border border-clay/25 bg-[#fff8f5] p-5">
              <p className="font-semibold text-[#a43d2a]">This invitation is no longer available.</p>
              <p className="mt-1 text-sm leading-6 text-ink/65">The host has not approved this place.</p>
            </section>
          ) : invitation.approvedDetails ? (
            <section className="mt-5 rounded-2xl border border-moss/20 bg-mist/60 p-5">
              <p className="font-semibold text-moss">
                You’re on the guest list. The private event details are now unlocked.
              </p>
              <h2 className="mt-4 text-sm font-semibold uppercase tracking-wider text-ink/50">
                Exact address
              </h2>
              <p className="mt-1 font-semibold">{invitation.approvedDetails.exactAddress}</p>
              {invitation.approvedDetails.entryInstructions && (
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  {invitation.approvedDetails.entryInstructions}
                </p>
              )}
              {invitation.approvedDetails.hostContact && (
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  <span className="font-semibold">Host contact:</span>{" "}
                  {invitation.approvedDetails.hostContact}
                </p>
              )}
            </section>
          ) : (
            <section className="mt-5 rounded-2xl border border-dashed border-moss/30 bg-mist/60 p-5">
              <p className="font-semibold text-moss">Exact address locked</p>
              <p className="mt-1 text-sm leading-6 text-ink/65">
                The exact address is shared only after the host approves your place.
              </p>
            </section>
          )}
          {canRespond && <InvitationResponse invitationId={invitation.id} />}
          <Link
            href={`/invitations/${invitation.id}/calendar`}
            className="mt-6 inline-flex min-h-11 items-center rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink hover:border-moss"
          >
            Add safe details to calendar
          </Link>
          {invitation.approvedDetails && invitation.event.plusOnePolicy !== "none" && (
            <PlusOneRequestForm eventId={invitation.event.id} />
          )}
          {!canRespond && !invitation.approvedDetails && (
            <p className="mt-6 text-sm text-ink/60">
              {isExpired
                ? "This invitation has expired."
                : invitation.status === "accepted" && invitation.membershipStatus === "requested"
                  ? "Your request is awaiting host approval."
                  : "This invitation is no longer available."}
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
