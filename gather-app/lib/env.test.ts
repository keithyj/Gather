import { describe, expect, it } from "vitest";
import { getPublicEnvironment } from "./env";

describe("public environment", () => {
  it("allows no Supabase config for the local mock", () => {
    expect(getPublicEnvironment({})).toEqual({});
  });

  it("requires the public Supabase pair together", () => {
    expect(() => getPublicEnvironment({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })).toThrow();
  });
});
