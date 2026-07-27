# Data model

## Core entities

### users

- id
- email
- display_name
- avatar_path
- date_of_birth_encrypted or age_over_18 assertion
- verification_level
- created_at
- deleted_at

### events

- id
- host_user_id
- title
- description
- event_type
- starts_at
- ends_at
- timezone
- broad_area
- exact_address_encrypted
- capacity
- status: draft, active, cancelled, completed
- plus_one_policy
- attendee_list_visibility
- photo_limit
- created_at

### invitations

- id
- event_id
- inviter_user_id
- invitee_user_id nullable
- invitee_email_hash nullable
- token_hash
- status: pending, accepted, declined, revoked, expired
- expires_at

### event_memberships

- id
- event_id
- user_id
- role: host, guest, plus_one
- approval_status: requested, approved, declined, removed
- rsvp_status: unknown, going, maybe, not_going
- introduced_by_membership_id nullable
- dietary_notes_encrypted
- accessibility_notes_encrypted
- approved_at

### plus_one_requests

- id
- event_id
- requester_membership_id
- proposed_user_id nullable
- proposed_email_hash nullable
- relationship_context
- note
- status

### event_updates

- id
- event_id
- author_user_id
- body
- created_at

### event_photos

- id
- event_id
- uploader_user_id
- original_path
- display_path
- placeholder_path
- moderation_status
- caption
- created_at
- deleted_at

### photo_reactions

- id
- photo_id
- user_id
- reaction_type
- created_at

### reports and blocks

Separate tables with immutable audit timestamps and restricted administrative access.

## RLS invariants

- Users read only their own sensitive profile fields.
- Event preview queries never select exact_address_encrypted.
- Exact event detail function returns sensitive fields only for approved memberships.
- Event photos require approved membership at query time.
- Only hosts can approve, decline, remove, or change event policy.
- Guests may create plus-one requests only when policy permits.
- No service-role key is shipped to the client.
