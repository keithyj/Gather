# Trust, safety, and privacy specification

This document is a product and engineering baseline, not final legal advice.

## Age policy

The MVP is 18+ only. Do not attempt to support minors in the same launch. Segregating minors by age does not remove safeguarding, grooming, location-sharing, moderation, and parental-consent risks.

## Verification levels

### Level 0 — account verified

- Email magic link.
- Device/session controls.
- Rate limits and bot protection.
- Required for private invitations.

### Level 1 — trusted network signals

- Existing approved relationships.
- Event attendance history.
- Mutual inviter context.
- Optional phone verification.

These are trust signals, not claims that a person is safe.

### Level 2 — identity verified

Reserved for future open-event access. Use a specialist vendor; store only verification result, vendor reference, country, age-over-threshold result, and timestamps where possible. Do not store raw identity documents in the primary app database.

## Location protection

- Store broad area separately from exact address.
- Exact address requires server-side authorisation.
- Never place exact addresses in analytics events, logs, push previews, email subject lines, OG tags, or public calendar metadata.
- Signed map links and image URLs must expire.
- Revoked or declined users lose access immediately.

## Plus-one safety

- A plus-one request contains name, optional profile link/account, relationship context, and request note.
- The host must explicitly approve.
- Original guests cannot view the exact address on behalf of an unapproved plus-one.
- Invitation forwarding must not transfer approval.

## Blocking and reporting

Blocking should prevent new invitations, plus-one requests, profile viewing where possible, and direct interaction. Reporting categories include impersonation, harassment, unsafe event, underage concern, spam, non-consensual imagery, and other.

## Photo safety

- Only approved attendees may upload or view.
- Strip EXIF location metadata.
- Preserve an encrypted or private original plus generated derivatives.
- Provide report and removal paths.
- Event host may hide a photo; uploader may delete their own photo.
- No face recognition, face clustering, or biometric labelling.
- Do not use event photos for public promotion without separate explicit consent.

## Incident principles

- Provide a clear “leave event” and block action.
- Retain auditable moderation events without retaining unnecessary sensitive content.
- Establish an emergency disclosure process before public/open events.
- Provide prominent real-world emergency guidance rather than pretending in-app reporting is immediate emergency assistance.
