# Hosted development and browser-flow verification

## Scope and approval gate

This runbook is for an isolated, non-production Supabase development project and an HTTPS preview deployment. It does not authorise production changes, paid services, public events, or use of real addresses or guest data.

Creating the project, linking the CLI, adding deployment secrets, and operating browser profiles are user-controlled external actions. Do not paste any secret into chat or commit it to the repository.

## Create and migrate an isolated development project

1. In the Supabase dashboard, create a new development-only project. Use only fake event and test-user data.
2. From this repository, authenticate and link the local CLI to that project's reference:

   ```bash
   pnpm supabase login
   pnpm supabase link --project-ref <development-project-ref>
   ```

3. Review the migration list, then apply the version-controlled migrations to that development project:

   ```bash
   pnpm supabase migration list
   pnpm supabase db push
   ```

Do not run `db push` against a production project. The rollback files are for disposable local/non-production recovery only and deliberately drop private event data.

## Authentication redirect configuration

The application uses the PKCE callback route exactly at `/auth/callback`. In Supabase Auth URL configuration, add these redirect URLs:

```text
http://localhost:3000/auth/callback
https://<preview-domain>/auth/callback
```

Set the hosted development project's Site URL to the preview origin (`https://<preview-domain>`). The `NEXT_PUBLIC_SITE_URL` value below must use the same origin. Do not configure `/auth/confirm`: that former client callback route is intentionally absent.

Magic links must be requested and opened in the same browser profile. Do not change the flow to implicit tokens to accommodate an automated browser.

## Preview environment variables

Set these exact variables in the preview environment, using the names in `.env.example`:

| Variable                        | Visibility    | Value                                             |
| ------------------------------- | ------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | public        | The isolated development project's HTTPS API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public        | The development project's anon/publishable key.   |
| `EVENT_DETAILS_ENCRYPTION_KEY`  | server secret | A new base64-encoded 32-byte development key.     |
| `NEXT_PUBLIC_SITE_URL`          | public        | `https://<preview-domain>` with no trailing path. |

Generate the development encryption key locally and place it directly in the deployment provider's secret UI:

```bash
openssl rand -base64 32
```

`SUPABASE_SERVICE_ROLE_KEY` is deliberately **not** an application environment variable. This application uses the anon key plus the signed-in user's session; it has no service-role client or administrative API path. Do not add a service-role key to the preview environment, browser code, tests, or repository merely because it is available in Supabase.

Never reuse the local encryption key. The encryption key must not use a `NEXT_PUBLIC_` prefix. Before deployment, inspect the provider's preview/production scope selection and set these values only for preview/development.

## Development-secret rotation

- Anon/publishable key: rotate in the development Supabase project, update the preview public value, redeploy, then invalidate the old key according to Supabase's rotation workflow.
- Encryption key: do **not** simply replace it while encrypted events exist—the current AES-GCM records cannot be decrypted with a new key. For this disposable development project, clear only fake test data or recreate the project before changing the key. A future production rotation requires a planned dual-key decrypt/re-encrypt migration.
- Session and redirect changes: request fresh links after changing Auth URLs or key material; do not reuse prior links.

## Required two-profile manual verification

Use a normal browser profile for the host and an independent incognito/private profile or separate browser for the guest. Use two email addresses you control and a fake address such as `12 Example Street, London E8 1AA`.

1. Host requests and opens a magic link in the same host profile, then completes the profile.
2. Host creates a housewarming, using the fake address.
3. Guest signs in in the separate profile. Host creates a private invitation for that existing account.
4. Guest opens the invitation and confirms it shows title, time, broad area, and the locked-address message only.
5. Guest accepts. Host approves. Guest refreshes and sees the fake address.
6. Host revokes/removes the guest. Guest refreshes, uses Back, and revisits the URL: the address must be absent each time.
7. Separately verify: invitation rejection; an unrelated account; logged-out access; direct protected URL in a fresh private window; direct protected endpoint while pending; plus-one request followed by both decline and approval; and removal after a previously loaded approved page.

## Address-leak inspection checklist

At pending, rejected, removed, revoked, unrelated, and logged-out states, search for the fake address in:

- network response bodies and request URLs;
- rendered HTML, React/Flight payloads, page source, metadata, and URL query parameters;
- browser local/session storage and cookies (the auth session cookie is expected, the address is not);
- console and deployment logs; and
- analytics or error-reporting payloads, if any are enabled.

The address may appear only in the authorised guest's server response after approval. It must not be present in unauthorised output or cached pages. The protected invitation and host-management routes are explicitly dynamic and send `Cache-Control: private, no-store`; revocation is rechecked by RLS on the next protected-data request.

Record the browser, account role, URL, expected state, actual state, and whether the fake address appeared. Stop the verification and treat any unauthorised appearance as a security issue; do not weaken PKCE or RLS to proceed.

## Automated coverage and remaining boundary

The repository's pgTAP suite proves database-level authorisation against local fixtures. Playwright additionally checks that a fake address is absent from the unauthorised preview URL, HTML, metadata, browser storage, console messages, and observed request URLs. It cannot replace the hosted two-profile test because that test requires real magic links and browser-held PKCE state.
