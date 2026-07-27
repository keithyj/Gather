# Codex prompt: Phase 1 backend and trust reveal

Implement the real Supabase-backed Phase 1 flow described in the repository documents.

Prioritise the security invariant: **an unauthorised user must never receive the exact address from the database, API, rendered HTML, metadata, logs, or analytics.**

Create migrations, generated types, RLS policies, server-side actions, and tests for users, events, invitations, and event memberships. Implement email magic-link authentication, expiring hashed invite tokens, RSVP requests, host approval, and approved-only exact detail retrieval.

Add automated negative tests for unauthenticated, pending, declined, removed, expired, and revoked states. Treat client UI hiding as cosmetic only. Update the implementation log and build-plan checkboxes truthfully.
