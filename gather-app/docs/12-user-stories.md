# User stories and acceptance criteria

## Create event

As a host, I can create a private housewarming event so I can invite people from several circles.

**Acceptance criteria**

- Drafts can be saved.
- Exact address is not part of the public preview payload.
- Capacity and timezone are required.
- The host can choose who may request a plus-one.

## Respond to invitation

As an invitee, I can view enough context and respond from my phone without installing an app.

**Acceptance criteria**

- Expired and revoked links show a safe error.
- RSVP does not reveal the exact address.
- Dietary and accessibility notes are visible only to the host.

## Approve attendee

As a host, I can approve or decline a request and understand who introduced a plus-one.

**Acceptance criteria**

- Approval is idempotent.
- Capacity cannot be exceeded in a race condition.
- Approval immediately grants sensitive-detail access.
- Decline does not disclose private host notes.

## View exact details

As an approved attendee, I can view the address and arrival instructions.

**Acceptance criteria**

- A pending, declined, removed, blocked, or unauthenticated user receives no sensitive fields.
- Revocation takes effect without requiring the user to sign out.
- Sensitive details do not appear in metadata or logs.

## Contribute memories

As an approved attendee, I can contribute up to three photos and view the private capsule.

**Acceptance criteria**

- The server enforces the quota.
- Location metadata is stripped.
- Non-members cannot retrieve a working photo URL.
- Uploader can delete; host can hide and report.
