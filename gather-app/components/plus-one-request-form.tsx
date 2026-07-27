"use client";

import { useState } from "react";
import { proposePlusOneAction } from "@/lib/actions/events";

export function PlusOneRequestForm({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState<string>();
  const [working, setWorking] = useState(false);
  async function submit(formData: FormData) {
    setWorking(true);
    const result = await proposePlusOneAction({
      eventId,
      recipient: String(formData.get("recipient")),
      relationshipContext: String(formData.get("relationshipContext")),
      note: String(formData.get("note") || "")
    });
    setMessage(result.error || result.success);
    setWorking(false);
  }
  return (
    <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-2xl">Ask about a plus-one</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        The host decides every request before anyone is added.
      </p>
      <form action={submit} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold" htmlFor="plus-one-recipient">
          Their Gather email or @username
        </label>
        <input
          id="plus-one-recipient"
          name="recipient"
          required
          placeholder="name@example.com or @maya_s"
          className="min-h-11 w-full rounded-xl border border-ink/15 px-3 outline-none focus:ring-2 focus:ring-moss/20"
        />
        <label className="block text-sm font-semibold" htmlFor="relationshipContext">
          How do you know each other?
        </label>
        <input
          id="relationshipContext"
          name="relationshipContext"
          required
          maxLength={180}
          className="min-h-11 w-full rounded-xl border border-ink/15 px-3 outline-none focus:ring-2 focus:ring-moss/20"
        />
        <label className="block text-sm font-semibold" htmlFor="plus-one-note">
          Note <span className="font-normal text-ink/50">(optional)</span>
        </label>
        <textarea
          id="plus-one-note"
          name="note"
          rows={2}
          maxLength={500}
          className="w-full rounded-xl border border-ink/15 px-3 py-2 outline-none focus:ring-2 focus:ring-moss/20"
        />
        <button
          type="submit"
          disabled={working}
          className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {working ? "Sending request…" : "Ask host"}
        </button>
      </form>
      <p aria-live="polite" className="mt-3 text-sm text-ink/65">
        {message}
      </p>
    </section>
  );
}
