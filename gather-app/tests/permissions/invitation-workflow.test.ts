import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260727210000_private_invitation_workflow.sql"),
  "utf8"
);

describe("private invitation workflow contract", () => {
  it("keeps email identifiers out of normal public profiles and resolves them only in a definer function", () => {
    expect(migration).toContain("create table private.profile_contact_identifiers");
    expect(migration).toContain(
      "revoke all on private.profile_contact_identifiers from public, anon, authenticated"
    );
    expect(migration).toContain("create or replace function private.resolve_profile_identifier");
  });

  it("limits identifier invitations, plus-one proposals, and cancellation to RPC boundaries", () => {
    expect(migration).toContain("create_private_invitation_by_identifier");
    expect(migration).toContain(
      "if not public.is_event_host(p_event_id) then raise exception 'Only the host can invite'"
    );
    expect(migration).toContain("propose_plus_one_by_identifier");
    expect(migration).toContain(
      "if not public.is_event_host(p_event_id) then raise exception 'Only the host can cancel'"
    );
  });

  it("stores private contact and instructions as ciphertext columns", () => {
    expect(migration).toContain("host_contact_ciphertext text");
    expect(migration).toContain("set_private_event_details");
  });
});
