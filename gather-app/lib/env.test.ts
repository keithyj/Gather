import { describe, expect, it } from "vitest";
import { getAdminEnvironment, getPublicEnvironment } from "./env";

describe("public environment", () => {
  it("allows no Supabase config for the local mock", () => {
    expect(getPublicEnvironment({})).toEqual({});
  });

  it("requires the public Supabase pair together", () => {
    expect(() => getPublicEnvironment({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })).toThrow();
  });

  it("accepts Supabase's publishable key name and normalises it for the clients", () => {
    expect(
      getPublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key"
      })
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "publishable-key"
    });
  });

  it("rejects conflicting legacy and publishable public keys", () => {
    expect(() =>
      getPublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-key",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key"
      })
    ).toThrow("Set only one Supabase public key");
  });

  it("requires a server-only service key for username resolution", () => {
    expect(() =>
      getAdminEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key"
      })
    ).toThrow();
  });
});
