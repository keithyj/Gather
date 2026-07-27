"use client";

import { useState } from "react";
import { decideGuestAction, inviteExistingUserAction } from "@/lib/actions/events";

type Membership = { id: string; userId: string; label: string; status: string; role: string };
type PlusOne = { id: string; label: string; status: string };

export function HostGuestManager({
  eventId,
  memberships,
  plusOnes
}: {
  eventId: string;
  memberships: Membership[];
  plusOnes: PlusOne[];
}) {
  const [message, setMessage] = useState<string>();
  const [working, setWorking] = useState(false);
  async function invite(formData: FormData) {
    setWorking(true);
    const result = await inviteExistingUserAction({
      eventId,
      inviteeId: String(formData.get("inviteeId")),
      expiresAt: new Date(String(formData.get("expiresAt"))).toISOString()
    });
    setMessage(result.error || result.success);
    setWorking(false);
  }
  async function decide(kind: "membership" | "invitation" | "plusOne", id: string, approve?: boolean) {
    setWorking(true);
    const result = await decideGuestAction({ eventId, kind, id, approve });
    setMessage(result.error || result.success);
    setWorking(false);
  }
  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-3xl">Invite an existing member</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          For this private pilot, use a signed-in guest’s account ID. No invitation email is sent, and no
          address is included in this step.
        </p>
        <form action={invite} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="inviteeId">
            Guest account ID
          </label>
          <input
            id="inviteeId"
            name="inviteeId"
            required
            placeholder="Guest account ID"
            className="min-h-11 rounded-xl border border-ink/15 px-3 outline-none focus:ring-2 focus:ring-moss/20"
          />
          <input name="expiresAt" type="hidden" value={new Date(Date.now() + 7 * 86400000).toISOString()} />
          <button
            disabled={working}
            className="min-h-11 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper disabled:opacity-60"
          >
            Create invitation
          </button>
        </form>
      </section>
      <section>
        <h2 className="font-display text-3xl">Attendance requests</h2>
        <div className="mt-4 space-y-3">
          {memberships.length ? (
            memberships.map((member) => (
              <article
                key={member.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{member.label}</p>
                  <p className="text-sm text-ink/60">
                    {member.role} · {member.status}
                  </p>
                </div>
                {member.status === "requested" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide("membership", member.id, false)}
                      disabled={working}
                      className="min-h-11 rounded-full border border-ink/15 px-4 text-sm font-semibold"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => decide("membership", member.id, true)}
                      disabled={working}
                      className="min-h-11 rounded-full bg-moss px-4 text-sm font-semibold text-white"
                    >
                      Approve guest
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-ink/20 p-5 text-sm text-ink/60">
              No guest requests yet.
            </p>
          )}
        </div>
      </section>
      <section>
        <h2 className="font-display text-3xl">Plus-one requests</h2>
        <div className="mt-4 space-y-3">
          {plusOnes.length ? (
            plusOnes.map((request) => (
              <article
                key={request.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{request.label}</p>
                  <p className="text-sm text-ink/60">{request.status}</p>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide("plusOne", request.id, false)}
                      disabled={working}
                      className="min-h-11 rounded-full border border-ink/15 px-4 text-sm font-semibold"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => decide("plusOne", request.id, true)}
                      disabled={working}
                      className="min-h-11 rounded-full bg-moss px-4 text-sm font-semibold text-white"
                    >
                      Approve guest
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-ink/20 p-5 text-sm text-ink/60">
              No plus-one requests yet.
            </p>
          )}
        </div>
      </section>
      <p aria-live="polite" className="text-sm text-ink/65">
        {message}
      </p>
    </div>
  );
}
