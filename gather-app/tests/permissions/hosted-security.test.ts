import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("hosted-development security regression contract", () => {
  it("uses one server callback URL for browser PKCE and local Supabase redirects", () => {
    expect(source("components/sign-in-form.tsx")).toContain(
      'new URL("/auth/callback", window.location.origin)'
    );
    const config = source("supabase/config.toml");
    expect(config).toContain("/auth/callback");
    expect(config).not.toContain("/auth/confirm");
    expect(source("app/auth/callback/route.ts")).toContain("destination.origin === base");
  });

  it("exposes an authenticated entry point without changing server-side guards", () => {
    const header = source("components/site-header.tsx");
    expect(header).toContain('href="/sign-in"');
    expect(header).toContain("signOutAction");
    expect(source("app/create/page.tsx")).toContain('redirect("/sign-in?next=/create")');
    expect(source("app/sign-in/page.tsx")).toContain("if (user) redirect(next)");
  });

  it("does not reference server secrets from browser-facing modules", () => {
    const browserSource = [
      "components/sign-in-form.tsx",
      "components/event-form.tsx",
      "components/host-guest-manager.tsx",
      "components/invitation-response.tsx",
      "lib/supabase/browser.ts"
    ]
      .map(source)
      .join("\n");
    expect(browserSource).not.toMatch(/EVENT_DETAILS_ENCRYPTION_KEY|SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("documents only the environment values this application actually uses", () => {
    const template = source(".env.example");
    expect(template).toContain("NEXT_PUBLIC_SUPABASE_URL=");
    expect(template).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=");
    expect(template).toContain("EVENT_DETAILS_ENCRYPTION_KEY=");
    expect(template).toContain("NEXT_PUBLIC_SITE_URL=");
    expect(template).toContain("SUPABASE_SERVICE_ROLE_KEY=");
  });

  it("keeps username resolution behind a server-only admin client", () => {
    expect(source("lib/supabase/admin.ts")).toContain('import "server-only"');
    expect(source("lib/actions/auth.ts")).toContain("resolve_login_email_by_username");
    expect(source("components/sign-in-form.tsx")).not.toContain("resolve_login_email_by_username");
  });

  it("keeps the exact address out of preview, metadata, browser storage, and logs in source", () => {
    const preview = source("app/preview/page.tsx");
    const layout = source("app/layout.tsx");
    const clientSource = [
      "components/event-form.tsx",
      "components/host-guest-manager.tsx",
      "components/invitation-response.tsx"
    ]
      .map(source)
      .join("\n");
    expect(preview).not.toMatch(/exactAddress|exact_address/i);
    expect(layout).not.toMatch(/exactAddress|exact_address/i);
    expect(clientSource).not.toMatch(/console\.(log|info|warn|error)|localStorage|sessionStorage/);
  });

  it("marks sensitive pages dynamic and sends no-store headers", () => {
    for (const path of ["app/invitations/[invitationId]/page.tsx", "app/host/events/[eventId]/page.tsx"]) {
      const page = source(path);
      expect(page).toContain('export const dynamic = "force-dynamic"');
      expect(page).toContain("export const revalidate = 0");
    }
    const config = source("next.config.ts");
    expect(config).toContain("/invitations/:path*");
    expect(config).toContain("/host/events/:path*");
    expect(config).toContain("private, no-store, max-age=0, must-revalidate");
  });
});
