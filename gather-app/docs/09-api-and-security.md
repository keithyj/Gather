# API and application security

## Architecture

Use server actions or route handlers as a narrow application boundary over Supabase. RLS remains the final authorisation layer. Do not rely on hidden client components or disabled buttons for access control.

## Key operations

- createEvent
- updateEvent
- createInviteLink
- revokeInviteLink
- requestMembership
- approveMembership
- declineMembership
- submitRsvp
- proposePlusOne
- approvePlusOne
- fetchApprovedEventDetails
- createPhotoUploadSession
- completePhotoUpload
- reactToPhoto
- reportContent
- blockUser

## Security requirements

- CSRF-safe authentication flow.
- Strict input validation with Zod.
- Rate limits by account, IP risk bucket, and operation.
- Invitation tokens stored as hashes.
- Signed URLs with short expiry.
- Content Security Policy and secure headers.
- Server-side checks for event capacity and duplicate membership.
- Idempotency for approval and upload completion.
- Audit log for sensitive host actions.
- Secrets only in environment variables and secret managers.
- Separate development, preview, and production projects.

## Analytics privacy

Track funnel events using opaque IDs. Never send exact addresses, dietary notes, accessibility notes, invitation tokens, photo URLs, emails, or free-form report text to analytics.
