# Codex operating instructions

## Mission

Build the smallest polished, secure, production-shaped MVP of Gather for a real housewarming event. Prioritise trust, privacy, accessibility, and completion of the core host-to-guest journey over feature breadth.

## Product principles

1. **Trust before reach.** Exact locations and attendee lists are sensitive.
2. **Private by default.** Nothing is public unless a future product phase explicitly makes it public.
3. **Approval is explicit.** Plus-ones are requests, not automatic invitations.
4. **Memories belong to attendees.** Event photos are visible only to approved attendees.
5. **No popularity leaderboard.** Do not implement public follower counts, star scores, or host rankings.
6. **Progressive disclosure.** Show only the information needed at each stage.
7. **Mobile-first, web-capable.** Build a responsive PWA first; native apps can follow.

## Engineering defaults

- Framework: Next.js with TypeScript and App Router.
- Styling: Tailwind CSS with a restrained design-token layer.
- Backend: Supabase Auth, Postgres, Row Level Security, Storage, and Realtime where useful.
- Forms and validation: React Hook Form plus Zod.
- Tests: Vitest for units and Playwright for critical journeys.
- Package manager: pnpm.
- Image handling: preserve originals, create optimised derivatives, strip unsafe metadata, never expose storage buckets publicly.
- Deployment target: Vercel plus Supabase.

If the repository already establishes different compatible conventions, follow the repository.

## Required workflow

Before implementation:

1. Read every file under `docs/`.
2. State the chosen slice and its acceptance criteria in the task log.
3. Inspect the existing code and reuse established components.
4. Make a small plan, then execute it without asking for approval unless credentials or destructive actions are required.

During implementation:

- Work in vertical slices.
- Keep migrations reversible.
- Add RLS policies with every sensitive table.
- Never fake security in client-side code.
- Never log addresses, ID documents, magic-link tokens, private image URLs, or full dates of birth.
- Use semantic HTML and keyboard-accessible controls.
- Avoid excessive blur, translucency, or low-contrast glass effects.
- Add loading, empty, success, and error states.

After implementation:

- Run lint, typecheck, unit tests, and relevant Playwright tests.
- Summarise changed files and any unresolved risks.
- Update `docs/11-build-plan.md` checkboxes only for genuinely completed work.

## Approval gates

Stop before:

- purchasing or enabling paid third-party services;
- changing production data;
- weakening an RLS policy;
- adding public event discovery;
- adding identity document storage;
- enabling under-18 accounts;
- introducing facial recognition or biometric inference;
- publishing legal claims as final legal advice.

## Definition of done

A feature is done only when it has:

- usable UI;
- server-side validation;
- authorisation and RLS coverage;
- happy-path and failure-path handling;
- tests for the critical rule;
- accessible labels and focus behaviour;
- documentation for non-obvious decisions.
