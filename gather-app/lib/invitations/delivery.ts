import "server-only";

export type PrivateInvitationDelivery = {
  invitationId: string;
  eventId: string;
  recipientProfileId: string;
};

/**
 * Provider-neutral delivery boundary. The MVP intentionally uses the authenticated in-app inbox only.
 * A future Mailpit/transactional provider implementation must not put protected location details in content.
 */
export async function queuePrivateInvitation(_: PrivateInvitationDelivery) {
  return { channel: "in_app" as const };
}
