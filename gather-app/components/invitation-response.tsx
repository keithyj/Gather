"use client";

import { useState } from "react";
import { respondToInvitationAction } from "@/lib/actions/events";

export function InvitationResponse({ invitationId }: { invitationId: string }) {
  const [message, setMessage] = useState<string>();
  const [working, setWorking] = useState(false);
  async function respond(accept: boolean) {
    setWorking(true);
    const result = await respondToInvitationAction({ invitationId, accept });
    setMessage(result.error || result.success);
    setWorking(false);
  }
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <button
          disabled={working}
          onClick={() => respond(true)}
          className="min-h-11 rounded-full bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-60"
        >
          Request to join
        </button>
        <button
          disabled={working}
          onClick={() => respond(false)}
          className="min-h-11 rounded-full border border-ink/20 px-5 py-3 font-semibold disabled:opacity-60"
        >
          Cannot attend
        </button>
      </div>
      <p aria-live="polite" className="mt-3 text-sm text-ink/65">
        {message}
      </p>
    </div>
  );
}
