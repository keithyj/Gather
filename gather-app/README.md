# Gather — trusted social events and private shared memories

Gather is a mobile-first social event app for creating intimate events, inviting across friendship groups, approving controlled plus-ones, revealing sensitive location details only after approval, and collecting a private event photo capsule.

The first real-world pilot is a housewarming meal. The MVP should optimise for one host successfully creating that event, inviting several friendship groups, approving guests and plus-ones, safely sharing the address, collecting RSVPs, and producing a beautiful private Polaroid-style photo album after the event.

## Start here

1. Install dependencies with `corepack pnpm install`. If your local Corepack installation has an outdated signing key, use `npm exec --yes --package=pnpm@9.15.4 pnpm install` instead.
2. For the Supabase-backed private-event flow, follow [the local Supabase setup guide](docs/14-supabase-local-development.md). For an isolated hosted preview, use the [hosted-development verification guide](docs/15-hosted-development-verification.md). Keep secrets out of version control.
3. Run `pnpm dev`, then open [http://localhost:3000](http://localhost:3000).

## Verification commands

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:permissions
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Without Supabase environment variables the app remains in a disabled local-UI state. With a local Supabase stack configured, event creation, invitations, and approved-only location reveal use server actions and RLS. Live database permission tests still require local auth fixtures; see the setup guide before treating the implementation as security verified.

## Authentication routes

- `/sign-in` requests an email magic link and redirects an existing signed-in user to their account (or the safe private route they originally requested).
- `/auth/callback` completes the existing PKCE exchange. Configure this exact path in Supabase Auth redirect URLs.
- With Supabase configured, `/create`, `/account`, invitation, and host-management routes enforce authentication server-side. The public landing page exposes sign-in and session-aware account navigation.

## Working name

**Gather** is a placeholder. Do not spend engineering time on naming or trademarks during the MVP.

## MVP definition

A successful MVP allows a host to:

- sign in with email magic link;
- create a private housewarming event;
- add teaser details while keeping the exact address hidden;
- invite friends by link or existing account;
- allow selected guests to propose one plus-one;
- approve or decline each guest and plus-one;
- reveal the address only to approved attendees;
- receive RSVPs and dietary notes;
- let attendees upload up to three event photos;
- display those photos as high-definition Polaroid-style cards;
- restrict the event album to approved attendees;
- close the event and retain a private memory capsule.

Open events, public discovery, star ratings, under-18 participation, payments, ticketing, and AI-generated social recommendations are explicitly out of MVP scope.
