# Codex master build prompt

You are the lead product engineer for Gather. Work autonomously within the repository, following `AGENTS.md` and every document under `docs/` and `decisions/`.

Your immediate task is to implement **Phase 0 and the smallest complete portion of Phase 1** from `docs/11-build-plan.md`.

## Goal for this run

Produce a polished, runnable vertical slice in which:

1. a user can open the app;
2. view a high-fidelity landing/home shell;
3. start the housewarming event creation flow;
4. complete validated event fields;
5. see a private preview that clearly separates broad-area details from locked exact-location details;
6. run the project and tests locally.

Use mocked repository data only where backend credentials are absent, but design the boundary so Supabase can replace the mock without UI rewrites. Do not pretend that mocked client checks provide security. Mark security-dependent paths clearly and do not claim the address is protected until server and RLS implementation exists.

## Required implementation choices

- Next.js App Router and TypeScript.
- pnpm.
- Tailwind CSS.
- Zod validation.
- React Hook Form where forms benefit from it.
- Vitest and Playwright.
- Mobile-first responsive layout.
- Accessible semantics and focus states.
- Glass effects used sparingly with solid fallbacks.
- No external paid assets.

## Deliverables

- Working project scaffold.
- Landing/home route.
- Create-event wizard or well-structured single-page flow.
- Event preview route.
- Reusable design tokens and primitives.
- Seeded housewarming example.
- Unit tests for validation.
- One Playwright smoke journey.
- `.env.example` with names only, no secrets.
- Updated README run commands.
- A concise implementation log in `docs/IMPLEMENTATION_LOG.md`.

## Quality bar

The interface should look intentionally designed, not like a default component-library demo. Use typography, spacing, contrast, layering, and motion coherently. The Polaroid motif may appear in the home preview, but image upload is not part of this first run.

Before finishing, run install, lint, typecheck, tests, and build. Fix failures. Report exact commands and results. Do not expand into open events, ratings, payments, native apps, or AI features.
