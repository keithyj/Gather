import "server-only";

import { decryptSensitiveDetail } from "@/lib/crypto";
import { getServerEnvironment } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ApprovedEventDetails = {
  exactAddress: string;
  entryInstructions: string | null;
  hostContact: string | null;
};

export type InvitationView = {
  id: string;
  status: "pending" | "accepted" | "rejected" | "revoked" | "expired";
  expiresAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    startsAt: string;
    broadArea: string;
    plusOnePolicy: string;
    status: "draft" | "active" | "cancelled" | "completed";
  };
  membershipStatus: "requested" | "approved" | "declined" | "removed" | null;
  approvedDetails: ApprovedEventDetails | null;
};

/**
 * This boundary relies on two independent checks: table RLS limits ciphertext reads,
 * then only this server-only module decrypts it for the authenticated approved attendee.
 */
export async function fetchApprovedEventDetails(eventId: string): Promise<ApprovedEventDetails | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("event_memberships")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("approval_status", "approved")
    .is("removed_at", null)
    .maybeSingle();
  if (!membership) return null;

  // RLS independently repeats the approved-membership check on this query.
  const { data: sensitiveDetails } = await supabase
    .from("event_sensitive_details")
    .select("exact_address_ciphertext, entry_instructions_ciphertext, host_contact_ciphertext")
    .eq("event_id", eventId)
    .maybeSingle();
  if (!sensitiveDetails) return null;

  const environment = getServerEnvironment();
  return {
    exactAddress: decryptSensitiveDetail(
      sensitiveDetails.exact_address_ciphertext,
      environment.EVENT_DETAILS_ENCRYPTION_KEY
    ),
    entryInstructions: sensitiveDetails.entry_instructions_ciphertext
      ? decryptSensitiveDetail(
          sensitiveDetails.entry_instructions_ciphertext,
          environment.EVENT_DETAILS_ENCRYPTION_KEY
        )
      : null,
    hostContact: sensitiveDetails.host_contact_ciphertext
      ? decryptSensitiveDetail(
          sensitiveDetails.host_contact_ciphertext,
          environment.EVENT_DETAILS_ENCRYPTION_KEY
        )
      : null
  };
}

export async function getInvitationView(invitationId: string): Promise<InvitationView | null> {
  const supabase = await createServerSupabaseClient();
  const { data: invitation } = await supabase
    .from("invitations")
    .select(
      "id, status, expires_at, events(id, title, description, starts_at, broad_area, plus_one_policy, status)"
    )
    .eq("id", invitationId)
    .maybeSingle();
  if (!invitation || !invitation.events) return null;

  const event = Array.isArray(invitation.events) ? invitation.events[0] : invitation.events;
  if (!event) return null;
  const { data: membership } = await supabase
    .from("event_memberships")
    .select("approval_status")
    .eq("event_id", event.id)
    .maybeSingle();
  const membershipStatus = (membership?.approval_status ?? null) as InvitationView["membershipStatus"];
  const approvedDetails =
    invitation.status === "accepted" && event.status === "active" && membershipStatus === "approved"
      ? await fetchApprovedEventDetails(event.id)
      : null;
  return {
    id: invitation.id,
    status: invitation.status as InvitationView["status"],
    expiresAt: invitation.expires_at,
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.starts_at,
      broadArea: event.broad_area,
      plusOnePolicy: event.plus_one_policy,
      status: event.status as InvitationView["event"]["status"]
    },
    membershipStatus,
    approvedDetails
  };
}

export async function getMyInvitationViews() {
  const supabase = await createServerSupabaseClient();
  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, status, expires_at, events(id, title, starts_at, broad_area, status)")
    .order("created_at", { ascending: false });
  return (invitations ?? []).flatMap((invitation) => {
    const event = Array.isArray(invitation.events) ? invitation.events[0] : invitation.events;
    if (!event) return [];
    return [
      {
        id: invitation.id,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        event: {
          id: event.id,
          title: event.title,
          startsAt: event.starts_at,
          broadArea: event.broad_area,
          status: event.status
        }
      }
    ];
  });
}
