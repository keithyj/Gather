# Implementation log

## 2026-07-27 — Supabase backend slice

### Plan and acceptance criteria

1. Add Supabase browser/server clients, strict public/server environment validation, and an email magic-link callback. The app must remain runnable in a clearly disabled state when credentials are absent.
2. Add a reversible migration containing profiles, trusted connections, private events, separately encrypted sensitive details, invitations, memberships/attendance, and plus-one requests. Enable RLS on every table and provide security-definer RPCs only where an atomic state transition is required.
3. Replace the mock repository with server-side event, invitation, and membership operations. Exact address plaintext crosses only the authenticated create action, is encrypted server-side, and is decrypted only after an approved-membership check.
4. Adapt the existing create flow and add minimal sign-in, host guest-management, and invitation screens without exposing sensitive details in routes, metadata, or client data.
5. Add validation/unit tests and migration-policy contract tests. A live RLS integration suite will be included but can run only against a local Supabase stack or isolated non-production project; it must not be described as passed until those prerequisites exist.

### Security acceptance criteria

- The general `events` table contains no exact address or entry instructions.
- Only the host or a currently approved membership may select a sensitive-details ciphertext row; pending, rejected, removed, revoked, unauthenticated, and unrelated users are denied by RLS.
- Server-side decryption occurs only after the approved-details repository query succeeds.
- Hosts alone can invite, approve, reject, revoke, remove, and approve plus-one requests.
- Event creation, membership approval, and capacity checks are atomic database operations.

### Current verification boundary

The repository contains migration-policy contract tests and a gated local-database companion. This machine has no Supabase CLI, Docker daemon, Supabase project, or environment variables, so no migration was applied and no live RLS query was executed. The implementation must not be represented as end-to-end security verified until the local stack is run with authenticated test fixtures.

### Implemented surface

- Supabase SSR clients, magic-link request/callback, automatic profile trigger, and profile completion screen.
- Replaced the mock repository with a server-only approved-details repository. AES-GCM encryption happens before sensitive details enter the database; decryption occurs only after an approved-membership lookup and RLS-sensitive-table query.
- Migration for profiles, trusted connections, private events, separate sensitive details, invitations, membership/attendance, plus-one requests, and audit records.
- RLS policies plus atomic RPCs for event creation, invitations, guest responses, host approval, revocation/removal, controlled plus-one proposals, and capacity enforcement.
- Authenticated host guest-management and invitation screens. The host screen does not render exact location details.

### Verification

- `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:permissions`, `pnpm build`, and `pnpm test:e2e` passed. The unit suite has 13 tests; the source-level permission suite has 6 tests; the Playwright smoke journey passed.
- `pnpm test:permissions:integration` is blocked: `supabase: command not found`. Docker is also unavailable. No hosted project was created and no production data or paid service was touched.

## 2026-07-27 — Phase 0 and Phase 1 preview slice

### Chosen slice

Implement a polished, local-only host journey: land on Gather, begin a housewarming invitation, validate the required event fields, and view an invite-safe preview.

### Acceptance criteria

- A visitor can open a responsive landing page and enter the housewarming setup flow.
- The form validates title, date, times, timezone, broad area, host-record address, capacity, description, and guest settings.
- The preview displays only invitation-safe fields: title, date/time, broad area, description, capacity, and plus-one policy.
- The exact address is neither included in the preview URL nor rendered in the preview page.
- The UI clearly says this is a mock boundary: no real event/address persistence or access control is claimed.
- Unit validation and a browser smoke journey cover the critical preview rule.

### Security note

This slice deliberately has no authentication, database, server action, encryption, or RLS policy. It must not be used to collect real home addresses. `lib/event-repository.ts` is an interface boundary only; the production implementation must put sensitive fields behind server-side authorisation and Supabase RLS before the create/respond journey is marked complete.

### Deferred work

Email sign-in, persistence, invitations, RSVP, host approval, authorised address reveal, Supabase configuration, RLS tests, plus-ones, uploads, and production deployment remain unchecked in the build plan.

### Verification

- `npm exec --yes --package=pnpm@9.15.4 pnpm install` — passed (the local Corepack installation had a signature-key error, so pnpm was invoked through npm without changing global tooling).
- `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, and `pnpm test` — passed; 5 unit tests passed.
- `pnpm build` — passed.
- `pnpm exec playwright install chromium && pnpm test:e2e` — passed; 1 Chromium smoke journey passed.
