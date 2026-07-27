"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";

export function ProfileForm({
  displayName,
  pronouns,
  ageOver18
}: {
  displayName: string;
  pronouns: string | null;
  ageOver18: boolean;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="displayName" className="text-sm font-semibold">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 outline-none focus:ring-2 focus:ring-moss/20"
        />
      </div>
      <div>
        <label htmlFor="pronouns" className="text-sm font-semibold">
          Pronouns <span className="font-normal text-ink/50">(optional)</span>
        </label>
        <input
          id="pronouns"
          name="pronouns"
          defaultValue={pronouns ?? ""}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 outline-none focus:ring-2 focus:ring-moss/20"
        />
      </div>
      <label className="flex min-h-11 items-start gap-3 rounded-xl border border-ink/10 p-3 text-sm leading-5">
        <input
          name="ageOver18"
          type="checkbox"
          defaultChecked={ageOver18}
          className="mt-0.5 size-4 accent-moss"
        />
        I confirm that I am 18 or over.
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
      <p aria-live="polite" className={state.error ? "text-sm text-[#a43d2a]" : "text-sm text-moss"}>
        {state.error || state.success}
      </p>
    </form>
  );
}
