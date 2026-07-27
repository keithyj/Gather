"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { encryptSensitiveDetail } from "@/lib/crypto";
import { getServerEnvironment } from "@/lib/env";
import { housewarmingSchema, type HousewarmingInput } from "@/lib/event-schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { queuePrivateInvitation } from "@/lib/invitations/delivery";

export type EventActionResult = { error?: string; eventId?: string };
export type ManageActionResult = { error?: string; success?: string };

export async function createEventAction(input: HousewarmingInput): Promise<EventActionResult> {
  const parsed = housewarmingSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the highlighted event fields." };

  try {
    const environment = getServerEnvironment();
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in before creating a private gathering." };
    const event = parsed.data;
    const { data, error } = await supabase.rpc("create_private_event", {
      p_title: event.title,
      p_description: event.description,
      p_event_date: event.date,
      p_start_time: event.startTime,
      p_end_time: event.endTime || null,
      p_timezone: event.timezone,
      p_broad_area: event.broadArea,
      p_capacity: event.capacity,
      p_plus_one_policy: event.plusOnePolicy,
      p_dietary_collection: event.dietaryCollection,
      p_alcohol_present: event.alcoholPresent,
      p_accessibility_note: event.accessibilityNote || null,
      p_exact_address_ciphertext: encryptSensitiveDetail(
        event.exactAddress,
        environment.EVENT_DETAILS_ENCRYPTION_KEY
      ),
      p_entry_instructions_ciphertext: null
    });
    if (error || !data)
      return { error: "We couldn’t create that gathering. Check your profile and try again." };
    const eventId = data as string;
    const { error: safeDetailsError } = await supabase
      .from("events")
      .update({
        dress_code: event.dressCode || null,
        food_and_drink_notes: event.foodAndDrinkNotes || null
      })
      .eq("id", eventId);
    const { error: privateDetailsError } = await supabase.rpc("set_private_event_details", {
      p_event_id: eventId,
      p_entry_instructions_ciphertext: event.entryInstructions
        ? encryptSensitiveDetail(event.entryInstructions, environment.EVENT_DETAILS_ENCRYPTION_KEY)
        : null,
      p_host_contact_ciphertext: event.hostContact
        ? encryptSensitiveDetail(event.hostContact, environment.EVENT_DETAILS_ENCRYPTION_KEY)
        : null
    });
    if (safeDetailsError || privateDetailsError)
      return { error: "We couldn’t finish saving private event details. Please try again." };
    revalidatePath("/host");
    return { eventId };
  } catch {
    return {
      error: "Event creation is unavailable until Supabase and the server encryption key are configured."
    };
  }
}

const inviteSchema = z.object({
  eventId: z.string().uuid(),
  recipient: z.string().trim().min(3, "Enter an email address or @username.").max(254),
  expiresAt: z.string().datetime()
});

export async function inviteExistingUserAction(
  input: z.infer<typeof inviteSchema>
): Promise<ManageActionResult> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the invitation details." };
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("create_private_invitation_by_identifier", {
      p_event_id: parsed.data.eventId,
      p_identifier: parsed.data.recipient,
      p_expires_at: parsed.data.expiresAt
    });
    if (error)
      return { error: "We couldn’t create that invitation. Ask the guest to create an account first." };
    const { data: invitation } = await supabase
      .from("invitations")
      .select("invitee_user_id")
      .eq("id", data as string)
      .maybeSingle();
    if (invitation)
      await queuePrivateInvitation({
        invitationId: data as string,
        eventId: parsed.data.eventId,
        recipientProfileId: invitation.invitee_user_id
      });
    revalidatePath(`/host/events/${parsed.data.eventId}`);
    return { success: "Private invitation created. It is ready in the guest’s Gather inbox." };
  } catch {
    return { error: "Invitations are unavailable until Supabase is configured." };
  }
}

const plusOneSchema = z.object({
  eventId: z.string().uuid(),
  recipient: z.string().trim().min(3, "Enter an email address or @username.").max(254),
  relationshipContext: z.string().trim().min(2, "Add a little context for the host.").max(180),
  note: z.string().trim().max(500).optional()
});

export async function proposePlusOneAction(
  input: z.infer<typeof plusOneSchema>
): Promise<ManageActionResult> {
  const parsed = plusOneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the plus-one request." };
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("propose_plus_one_by_identifier", {
      p_event_id: parsed.data.eventId,
      p_identifier: parsed.data.recipient,
      p_relationship_context: parsed.data.relationshipContext,
      p_note: parsed.data.note || null
    });
    if (error)
      return { error: "That plus-one request could not be sent. Check the account and event policy." };
    revalidatePath("/invitations");
    return { success: "Plus-one request sent to the host." };
  } catch {
    return { error: "Plus-one requests are unavailable until Supabase is configured." };
  }
}

export async function cancelEventAction(eventId: string): Promise<ManageActionResult> {
  if (!z.string().uuid().safeParse(eventId).success) return { error: "Invalid event." };
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("cancel_private_event", { p_event_id: eventId });
    if (error) return { error: "Only the host can cancel this gathering." };
    revalidatePath(`/host/events/${eventId}`);
    revalidatePath("/invitations");
    return { success: "Gathering cancelled. Guests will see the update in their inbox." };
  } catch {
    return { error: "Cancellation is unavailable until Supabase is configured." };
  }
}

const decisionSchema = z.object({
  eventId: z.string().uuid(),
  kind: z.enum(["membership", "invitation", "plusOne"]),
  id: z.string().uuid(),
  approve: z.boolean().optional()
});

export async function decideGuestAction(input: z.infer<typeof decisionSchema>): Promise<ManageActionResult> {
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid guest action." };
  try {
    const supabase = await createServerSupabaseClient();
    const { kind, id, approve } = parsed.data;
    const response =
      kind === "membership"
        ? await supabase.rpc("approve_membership", { p_membership_id: id, p_approve: Boolean(approve) })
        : kind === "plusOne"
          ? await supabase.rpc("decide_plus_one", { p_request_id: id, p_approve: Boolean(approve) })
          : await supabase.rpc("revoke_invitation", { p_invitation_id: id });
    if (response.error)
      return { error: "That change could not be applied. It may already have been decided." };
    revalidatePath(`/host/events/${parsed.data.eventId}`);
    return { success: "Guest list updated." };
  } catch {
    return { error: "Guest management is unavailable until Supabase is configured." };
  }
}

const responseSchema = z.object({ invitationId: z.string().uuid(), accept: z.boolean() });

export async function respondToInvitationAction(
  input: z.infer<typeof responseSchema>
): Promise<ManageActionResult> {
  const parsed = responseSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid invitation response." };
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("respond_to_invitation", {
      p_invitation_id: parsed.data.invitationId,
      p_accept: parsed.data.accept
    });
    if (error) return { error: "That invitation is no longer available." };
    revalidatePath(`/invitations/${parsed.data.invitationId}`);
    return { success: parsed.data.accept ? "Your request is with the host." : "Invitation declined." };
  } catch {
    return { error: "Invitation responses are unavailable until Supabase is configured." };
  }
}
