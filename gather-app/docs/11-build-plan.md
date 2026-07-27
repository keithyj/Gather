# Build plan

## Phase 0 — repository and foundations

- [x] Create Next.js TypeScript project with pnpm.
- [x] Configure Tailwind and design tokens.
- [x] Add linting, formatting, typecheck, Vitest, and Playwright.
- [x] Configure environment validation.
- [ ] Create Supabase local configuration and typed database client.
- [ ] Add CI for lint, typecheck, unit tests, and build.

## Phase 1 — vertical slice: create and respond

- [ ] Email magic-link sign-in.
- [ ] Profile setup.
- [x] Event creation wizard for the housewarming template.
- [x] Private event preview page.
- [ ] Expiring invitation link.
- [ ] RSVP request.
- [ ] Host approval queue.
- [ ] Approved-only exact address reveal.
- [x] RLS tests proving unauthorised users cannot retrieve the address.
- [x] Responsive, accessible UI with loading and failure states.

## Phase 2 — controlled social graph

- [ ] Plus-one request and approval.
- [ ] Capacity enforcement.
- [ ] Attendee-list privacy settings.
- [ ] Event updates and notification emails.
- [ ] Blocking and invitation revocation.

## Phase 3 — memory capsule

- [ ] Private image upload pipeline.
- [ ] Three-photo quota.
- [ ] EXIF stripping and derivatives.
- [ ] Polaroid album UI.
- [ ] Reactions and private captions.
- [ ] Removal and reporting flows.

## Phase 4 — pilot hardening

- [ ] Threat-model review.
- [ ] Accessibility audit.
- [ ] Analytics with sensitive-field exclusions.
- [ ] Data export/deletion workflow.
- [ ] Pilot runbook and support contact.
- [ ] Production deployment and smoke tests.
