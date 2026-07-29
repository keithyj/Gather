# Implementation log

## 2026-07-27 — Supabase backend slice

### Plan and acceptance criteria

1. Add Supabase browser/server clients, strict public/server environment validation, and an email-confirmation callback. The app must remain runnable in a clearly disabled state when credentials are absent.
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
- The Codex in-app browser could not complete the prior local email-link flow because its verifier was unavailable on return. The application now uses password sign-up/sign-in and retains Supabase's secure code-exchange callback for email confirmation; it does not fall back to an implicit token flow.
- Final local checks passed: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` (13 tests), `pnpm test:permissions` (6 tests), `pnpm test:permissions:integration` (11 pgTAP tests), `pnpm supabase test db` (11 pgTAP tests), `pnpm build`, and `pnpm test:e2e` (1 smoke test).

### Hosted development preparation — 2026-07-27

Chosen slice: prepare a non-production preview handoff while preserving PKCE and keeping all sensitive routes dynamically rendered and non-cacheable.

- Canonicalised the browser magic-link redirect to `/auth/callback`, matching the local Supabase redirect configuration. The callback response is explicit `no-store` and does not log link codes or errors.
- Marked invitation and host-management pages as dynamic and added `private, no-store` plus no-index headers for both route families.
- Added source-level secret/cache regressions and expanded the Playwright preview test to assert a fake address is absent from its unauthorised URL, HTML, metadata, web storage, console, and observed request URLs.
- Added the hosted-development runbook. The current username/password sign-in action uses a server-only service-role client solely to resolve an existing username to an email; it never exposes this key to browser code.
- No hosted Supabase project, deployment, credentials, external email service, or production resource was created or changed. Hosted email-confirmation and two-profile verification remains a user-controlled external gate.

### Authentication entry point — 2026-07-27

Chosen slice: make the existing PKCE sign-in flow discoverable and usable without adding a parallel authentication path.

- The landing and account navigation now provide a visible sign-in route for signed-out visitors and the authenticated user's email/avatar initial, account link, and sign-out action for signed-in visitors.
- `/sign-in` preserves a safe internal return path through the existing `/auth/callback` flow and redirects an already authenticated user away from the sign-in form.
- `/create` is server-protected whenever Supabase is configured; the no-credential local preview remains available for visual smoke coverage.
- Added navigation and server-guard regression assertions plus a Playwright entry-point smoke test. Hosted email-confirmation completion remains subject to the configured Supabase project and a browser that retains its session state.

### Private invitation workflow slice — 2026-07-27

Chosen slice: complete the host-invites-existing-guest path without adding public discovery or outbound email delivery.

- Added sign-up metadata for a unique username, with email identifiers isolated in a non-API schema and resolved only by security-definer invitation RPCs.
- Added an authenticated dashboard and in-app invitation inbox. Hosts invite existing accounts by email or `@username`; the guest can accept, await host approval, request an allowed plus-one, receive an approved-only private-detail reveal, and observe cancellation/revocation immediately on the next request.
- Added separate encrypted entry instructions and optional host contact, a safe broad-area-only calendar download, host cancellation, and provider-neutral in-app invitation delivery. No real email was sent or configured.
- After Docker Desktop was repaired, `pnpm supabase db reset` applied the workflow migration cleanly and both `pnpm test:permissions:integration` and `pnpm supabase test db` passed all 11 pgTAP assertions. The fixture was updated with required usernames introduced by the migration.

### Implemented surface

- Supabase SSR clients, email-confirmation callback, automatic profile trigger, and profile completion screen.

### Password authentication correction — 2026-07-27

- Replaced the visible email-link sign-in form with standard password authentication: account creation collects a display name, unique username, email address, and password; sign-in accepts either the email address or username plus password.
- New accounts still confirm their email through `/auth/callback`. That callback is dynamic, no-store, and safely validates internal return paths. Password sign-in creates the normal Supabase session, so signing out and returning later requires no emailed sign-in link.
- Added a server-only service-role client and a non-public database resolver for username-to-email lookup. The browser cannot call that resolver or receive the service-role key. Email sign-in avoids this resolver entirely.
- The environment parser now supports Supabase's current `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` name and the legacy local CLI anon-key name, but intentionally rejects conflicting values. Hosted deployment configuration must add `SUPABASE_SERVICE_ROLE_KEY` as a server secret before username sign-in can work; it must not be pasted into chat or committed.
- Verification after recreating the local database from all migrations: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` (26 tests), `pnpm test:permissions` (16 tests), `pnpm test:permissions:integration` (11 pgTAP assertions), `pnpm supabase test db` (11 pgTAP assertions), `pnpm build`, and `pnpm test:e2e` (2 browser smoke tests) passed. No hosted account, secret, or deployment was changed.

### Confirmation completion diagnostic — 2026-07-27

Chosen slice: make a failed password-account confirmation actionable without disclosing auth-code details or weakening PKCE.

Acceptance criteria:

- A successful confirmation continues to establish an authenticated session through `/auth/callback`.
- A failed code exchange renders a clear, non-sensitive same-browser/same-host recovery message instead of looking like a second required sign-in.
- No code, token, email address, or internal authentication error is rendered or logged.

## 2026-07-29 — Authentication completion screen and delivery diagnostics

Chosen slice: make password sign-up a single submission followed by a dedicated confirmation screen, while surfacing safe Supabase delivery and callback failures.

Acceptance criteria:

- Successful sign-up navigates to `/check-email` rather than leaving success copy under the form.
- The confirmation screen contains no email address, password, token, or browser-persisted sign-up data.
- Duplicate usernames are rejected by a server-only availability check and remain protected by the database unique constraint.
- Supabase error codes are mapped to clear copy for unconfirmed email, rate limiting, expired confirmation, browser mismatch, and service unavailability.
- Invalid email/password responses remain deliberately generic so the form cannot be used to enumerate registered email accounts.
- Hosted email delivery is not claimed as verified until Supabase Auth logs and a real confirmation message demonstrate it.

Local verification passed: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` (30 tests), `pnpm test:permissions` (17 tests), `pnpm test:permissions:integration` (11 pgTAP assertions), `pnpm supabase test db` (11 pgTAP assertions), `pnpm build`, and `pnpm test:e2e` (2 browser tests).

Hosted verification remains incomplete. The project owner must inspect Supabase Auth logs for the attempted confirmation and verify that the test address is authorised for the built-in SMTP service or configure a development SMTP provider. The built-in provider's current two-email-per-hour project limit may also require waiting before another attempt. No hosted settings, external provider, or production resource was changed in this implementation run.

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
