"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createEventAction } from "@/lib/actions/events";
import { housewarmingSchema, type HousewarmingInput } from "@/lib/event-schema";

const defaultValues: HousewarmingInput = {
  title: "New keys, old friends",
  date: "2026-09-12",
  startTime: "19:00",
  endTime: "22:00",
  timezone: "Europe/London",
  broadArea: "Hackney, East London",
  exactAddress: "",
  description: "A slow dinner, a few new introductions, and a toast to this little place.",
  capacity: 14,
  plusOnePolicy: "selected",
  alcoholPresent: true,
  dietaryCollection: true,
  accessibilityNote: ""
};

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-ink shadow-sm outline-none placeholder:text-ink/35 focus:border-moss focus:ring-2 focus:ring-moss/20";
const labelClass = "text-sm font-semibold text-ink";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1.5 text-sm font-medium text-[#a43d2a]" role="alert">
      {message}
    </p>
  ) : null;
}

export function EventForm() {
  const router = useRouter();
  const [submissionState, setSubmissionState] = useState<"idle" | "saving">("idle");
  const [submissionError, setSubmissionError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<HousewarmingInput>({ resolver: zodResolver(housewarmingSchema), defaultValues });

  async function submit(values: HousewarmingInput) {
    setSubmissionError(undefined);
    setSubmissionState("saving");
    const result = await createEventAction(values);
    if (result.eventId) router.push(`/host/events/${result.eventId}`);
    else setSubmissionState("idle");
    if (result.error) setSubmissionError(result.error);
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-8" aria-describedby="form-status">
      <p id="form-status" className="sr-only" aria-live="polite">
        {submissionState === "saving" ? "Creating your private gathering." : ""}
      </p>
      <section
        aria-labelledby="event-basics"
        className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-moss">01 · The invitation</p>
          <h2 id="event-basics" className="mt-2 font-display text-3xl">
            Set the tone
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            These details are visible to invitees before approval.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="title">
              Gathering title
            </label>
            <input id="title" className={fieldClass} {...register("title")} />
            <FieldError message={errors.title?.message} />
          </div>
          <div>
            <label className={labelClass} htmlFor="date">
              Date
            </label>
            <input id="date" type="date" className={fieldClass} {...register("date")} />
            <FieldError message={errors.date?.message} />
          </div>
          <div>
            <label className={labelClass} htmlFor="timezone">
              Timezone
            </label>
            <select id="timezone" className={fieldClass} {...register("timezone")}>
              <option value="Europe/London">London (BST/GMT)</option>
              <option value="America/New_York">New York (ET)</option>
              <option value="America/Los_Angeles">Los Angeles (PT)</option>
            </select>
            <FieldError message={errors.timezone?.message} />
          </div>
          <div>
            <label className={labelClass} htmlFor="startTime">
              Start time
            </label>
            <input id="startTime" type="time" className={fieldClass} {...register("startTime")} />
            <FieldError message={errors.startTime?.message} />
          </div>
          <div>
            <label className={labelClass} htmlFor="endTime">
              End time <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <input id="endTime" type="time" className={fieldClass} {...register("endTime")} />
            <FieldError message={errors.endTime?.message} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="description">
              A note for your guests
            </label>
            <textarea id="description" rows={3} className={fieldClass} {...register("description")} />
            <FieldError message={errors.description?.message} />
          </div>
        </div>
      </section>
      <section
        aria-labelledby="location"
        className="rounded-3xl border border-moss/15 bg-[#f1f5ed] p-5 sm:p-7"
      >
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-moss">02 · Location</p>
          <h2 id="location" className="mt-2 font-display text-3xl">
            Share in layers
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Invitees see the broad area. Your exact address is encrypted before it is stored separately.
          </p>
        </div>
        <div className="grid gap-5">
          <div>
            <label className={labelClass} htmlFor="broadArea">
              Neighbourhood or broad area
            </label>
            <input
              id="broadArea"
              className={fieldClass}
              placeholder="e.g. Hackney, East London"
              {...register("broadArea")}
            />
            <p className="mt-1.5 text-sm text-ink/55">This appears on the invitation preview.</p>
            <FieldError message={errors.broadArea?.message} />
          </div>
          <div>
            <label className={labelClass} htmlFor="exactAddress">
              Exact address <span className="text-clay">approved guests only</span>
            </label>
            <textarea
              id="exactAddress"
              rows={2}
              className={fieldClass}
              placeholder="Full address and entry information"
              {...register("exactAddress")}
            />
            <p className="mt-1.5 rounded-xl border border-clay/20 bg-white/70 p-3 text-sm leading-5 text-ink/70">
              This field is sent only to the authenticated server action, encrypted before database storage,
              and never included in the invitation preview.
            </p>
            <FieldError message={errors.exactAddress?.message} />
          </div>
        </div>
      </section>
      <section
        aria-labelledby="guest-settings"
        className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-moss">03 · Guest settings</p>
          <h2 id="guest-settings" className="mt-2 font-display text-3xl">
            Make room for people
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="capacity">
              Capacity
            </label>
            <input
              id="capacity"
              type="number"
              min="2"
              max="100"
              className={fieldClass}
              {...register("capacity")}
            />
            <FieldError message={errors.capacity?.message} />
          </div>
          <fieldset>
            <legend className={labelClass}>Plus-ones</legend>
            <select className={fieldClass} {...register("plusOnePolicy")}>
              <option value="none">No plus-ones</option>
              <option value="selected">Selected guests can ask</option>
              <option value="all">Any approved guest can ask</option>
            </select>
            <p className="mt-1.5 text-sm text-ink/55">All proposals need your approval.</p>
          </fieldset>
          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Guest care</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-ink/10 px-3">
                <input type="checkbox" className="size-4 accent-moss" {...register("dietaryCollection")} />
                Collect dietary requirements
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-ink/10 px-3">
                <input type="checkbox" className="size-4 accent-moss" {...register("alcoholPresent")} />
                Alcohol may be served
              </label>
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="accessibilityNote">
              Accessibility note <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <input
              id="accessibilityNote"
              className={fieldClass}
              placeholder="Invite guests to share what would make arrival easier."
              {...register("accessibilityNote")}
            />
            <FieldError message={errors.accessibilityNote?.message} />
          </div>
        </div>
      </section>
      <div className="flex flex-col gap-3 rounded-3xl bg-ink p-5 text-paper sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm leading-6 text-paper/75">
          Create a private event. The exact address is not placed in URLs, previews, or client-side event
          data.
        </p>
        <button
          type="submit"
          disabled={submissionState === "saving"}
          className="min-h-11 rounded-full bg-clay px-5 py-3 font-semibold text-white transition hover:bg-[#e57c5b] disabled:cursor-wait disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
        >
          {submissionState === "saving" ? "Creating gathering…" : "Create private gathering"}
        </button>
      </div>
      {submissionError && (
        <p role="alert" className="text-center text-sm font-medium text-[#a43d2a]">
          {submissionError}
        </p>
      )}
      {isDirty && (
        <p className="text-center text-sm text-ink/50">
          Your invitation preview will show broad-area details only.
        </p>
      )}
    </form>
  );
}
