import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260727180000_private_housewarming.sql"),
  "utf8"
);

describe("private-housewarming RLS policy contract", () => {
  it("enables RLS for every table holding private event data", () => {
    for (const table of [
      "profiles",
      "trusted_connections",
      "events",
      "event_sensitive_details",
      "invitations",
      "event_memberships",
      "plus_one_requests",
      "sensitive_action_audit"
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("keeps plaintext exact address out of the general events table", () => {
    const eventsDefinition = migration.match(/create table public\.events \(([\s\S]*?)\n\);/)?.[1] ?? "";
    expect(eventsDefinition).not.toMatch(/exact_address/i);
    expect(migration).toContain("exact_address_ciphertext text not null");
  });

  it("limits sensitive-detail selection to the host or an active approved membership", () => {
    const policy =
      migration.match(
        /create policy "only host and approved attendees select sensitive ciphertext"([\s\S]*?);/
      )?.[1] ?? "";
    expect(policy).toContain("public.is_event_host(event_id)");
    expect(policy).toContain("public.has_approved_membership(event_id)");
    expect(migration).toContain("approval_status = 'approved' and removed_at is null");
  });

  it("removes a membership when the host revokes an invitation", () => {
    expect(migration).toContain(
      "update public.event_memberships set approval_status = 'removed', removed_at = now()"
    );
  });

  it("does not treat removed or declined members as current event participants", () => {
    const membershipPredicate =
      migration.match(/create or replace function public\.has_event_membership([\s\S]*?)\n\$\$;/)?.[1] ?? "";
    expect(membershipPredicate).toContain(
      "approval_status in ('requested', 'approved') and removed_at is null"
    );
  });

  it("serializes capacity checks under an event row lock before approval", () => {
    const approvalFunction =
      migration.match(/create or replace function public\.approve_membership([\s\S]*?)\n\$\$;/)?.[1] ?? "";
    expect(approvalFunction).toContain("where id = v_membership.event_id for update");
    expect(approvalFunction).toContain(
      "if v_approved_count >= v_event.capacity then raise exception 'Event capacity reached'"
    );
  });
});
