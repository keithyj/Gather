# Supabase local development and verification

## What this phase provides

The migration at `supabase/migrations/20260727180000_private_housewarming.sql` creates the private-housewarming data model, RLS policies, and atomic database functions. Exact address and entry-instruction plaintext are not database columns. The Next.js server encrypts them with AES-256-GCM before calling `create_private_event`.

The encryption key is server-only. It is not an alternative to RLS: RLS limits which authenticated database role can retrieve ciphertext, while server-side decryption is only reached after an approved-membership query succeeds.

## Prerequisites

- Docker Desktop (or an equivalent Docker daemon) for a local Supabase stack.
- Supabase CLI. Do not point local development at a production project.
- Node.js and pnpm.

No Supabase project needs to be created to use the local workflow. Creating a hosted project, configuring hosted email delivery, or adding production environment variables is a separate user-authorised step.

## Local setup

1. Install the Supabase CLI and start Docker.
2. From `gather-app`, run `pnpm supabase start`. It applies `supabase/config.toml` and prints local API URL and anon key.
3. Copy `.env.example` to `.env.local`. Set the local `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` printed by the CLI.
4. Generate a development-only encryption key: `openssl rand -base64 32`. Put the result in `EVENT_DETAILS_ENCRYPTION_KEY`.
5. Run `pnpm supabase db reset` whenever you need to reapply all local migrations.
6. Start the app with `pnpm dev`, request a magic link, and open the Mailpit URL reported by `pnpm supabase status`.
7. Complete the profile’s 18+ self-attestation before creating an event. This is not identity verification.

If a browser reports that the PKCE verifier is unavailable after opening a local magic link, request a fresh link in that same browser and confirm that cookies are enabled for `127.0.0.1`. Do not switch this implementation to an implicit token flow as a workaround.

Never reuse the local encryption key in preview or production. Never put a service-role key in `.env.local`, browser code, or tests.

## Migration and rollback

- Forward migrations: `supabase/migrations/20260727180000_private_housewarming.sql` and `supabase/migrations/20260727181000_authenticated_table_grants.sql`
- Local/non-production rollback companions: matching files under `supabase/rollback/`

The rollback script deliberately drops private-event data. Use it only for a disposable local database, never as a production rollback plan.

## Permission verification

Run the source-level policy contract suite in every environment:

```bash
pnpm test:permissions
```

It asserts that RLS is enabled, the general event table has no address field, sensitive details require `has_approved_membership`, revocation removes membership access, and capacity approval locks the event row.

Run the live database companion only after a local stack is running:

```bash
pnpm supabase db reset
pnpm test:permissions:integration
```

The integration fixture creates disposable local auth-shaped fixtures and executes unauthenticated, pending, declined, removed, revoked, unrelated, and approved-role ciphertext queries. It also proves that a guest cannot approve themselves, mutate host-owned event data, or decide a plus-one request. On 2026-07-27, the local stack was reset from migrations and this suite passed with all 11 assertions.

For the full manual browser check, use separate browser profiles for the host and guest. Confirm that the invitation page renders only its safe preview before approval, that revocation removes location access after refresh, and that the protected value is not present in the URL or browser-visible page source while access is denied.

## Security boundary

The UI does not decide whether a guest may see a location. The invitation screen requests event general information under RLS, then requests encrypted details only when the membership is approved. If an invitation is revoked or membership is removed, the database policy denies the sensitive query on the next request, without requiring the guest to sign out.
