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

### Local verification update — 2026-07-27

- Started the local Supabase stack without creating or linking a hosted project.
- `pnpm supabase db reset` rebuilt the database from version-controlled migrations. The first live RLS run exposed missing PostgreSQL table grants for the API roles; `20260727181000_authenticated_table_grants.sql` adds only the privileges needed for RLS evaluation. The sensitive-details RLS policy remains unchanged and denies unauthorised rows.
- `pnpm supabase test db` and `pnpm test:permissions:integration` each passed all 11 pgTAP assertions, including host/approved access and pending, declined, removed, revoked, unrelated, and unauthenticated denial.
- Created an ignored local `.env.local` from `pnpm supabase status -o env`, plus a development-only encryption key. No credential was committed.
- The Codex in-app browser could request a local magic link but its PKCE verifier was unavailable on return. The implementation preserves PKCE and does not fall back to an implicit token flow. The full interactive two-user browser journey therefore remains unverified in this browser until it can retain the verifier cookie.
- Final local checks passed: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` (13 tests), `pnpm test:permissions` (6 tests), `pnpm test:permissions:integration` (11 pgTAP tests), `pnpm supabase test db` (11 pgTAP tests), `pnpm build`, and `pnpm test:e2e` (1 smoke test).

### Hosted development preparation — 2026-07-27

Chosen slice: prepare a non-production preview handoff while preserving PKCE and keeping all sensitive routes dynamically rendered and non-cacheable.

- Canonicalised the browser magic-link redirect to `/auth/callback`, matching the local Supabase redirect configuration. The callback response is explicit `no-store` and does not log link codes or errors.
- Marked invitation and host-management pages as dynamic and added `private, no-store` plus no-index headers for both route families.
- Added source-level secret/cache regressions and expanded the Playwright preview test to assert a fake address is absent from its unauthorised URL, HTML, metadata, web storage, console, and observed request URLs.
- Added the hosted-development runbook. It intentionally does not use or configure a service-role key because no application path requires one.
- No hosted Supabase project, deployment, credentials, external email service, or production resource was created or changed. Hosted magic-link and two-profile verification remains a user-controlled external gate.

### Authentication entry point — 2026-07-27

Chosen slice: make the existing PKCE sign-in flow discoverable and usable without adding a parallel authentication path.

- The landing and account navigation now provide a visible sign-in route for signed-out visitors and the authenticated user's email/avatar initial, account link, and sign-out action for signed-in visitors.
- `/sign-in` preserves a safe internal return path through the existing `/auth/callback` flow and redirects an already authenticated user away from the sign-in form.
- `/create` is server-protected whenever Supabase is configured; the no-credential local preview remains available for visual smoke coverage.
- Added navigation and server-guard regression assertions plus a Playwright entry-point smoke test. Hosted magic-link completion remains subject to the configured Supabase project and a browser that retains its PKCE state.

### Implemented surface

- Supabase SSR clients, magic-link request/callback, automatic profile trigger, and profile completion screen.
- Replaced the mock repository with a server-only approved-details repository. AES-GCM encryption happens before sensitive details enter the database; decryption occurs only after an approved-membership lookup and RLS-sensitive-table query.
- Migration for profiles, trusted connections, private events, separate sensitive details, invitations, membership/attendance, plus-one requests, and audit records.
- RLS policies plus atomic RPCs for event creation, invitations, guest responses, host approval, revocation/removal, controlled plus-one proposals, and capacity enforcement.
- Authenticated host guest-management and invitation screens. The host screen does not render exact location details.

### Verification

- `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:permissions`, `pnpm build`, and `pnpm test:e2e` passed. The unit suite has 13 tests; the source-level permission suite has 6 tests; the Playwright smoke journey passed.
- The remaining browser verification limitation is documented above. No hosted project was created and no production data or paid service was touched.

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
