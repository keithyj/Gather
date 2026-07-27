import Link from "next/link";
import { Brand } from "./brand";
import { signOutAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  let email: string | undefined;
  let avatarUrl: string | undefined;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      email = user?.email;
      avatarUrl =
        typeof user?.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : undefined;
    } catch {
      // The public landing page remains available if an expired session cannot be refreshed.
    }
  }

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Brand />
      <nav className="flex items-center gap-2" aria-label="Account navigation">
        {email ? (
          <>
            <Link
              href="/account"
              className="inline-flex min-h-10 max-w-48 items-center gap-2 rounded-full px-2 text-sm font-semibold text-ink hover:bg-mist focus:outline-none focus:ring-2 focus:ring-clay"
            >
              {avatarUrl ? (
                // The avatar URL comes from the authenticated user profile only; no address or event data is used here.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-moss text-xs font-bold text-paper"
                >
                  {email.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="truncate">{email}</span>
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="min-h-10 rounded-full border border-ink/15 bg-white px-3 text-sm font-semibold text-ink hover:border-ink/35 focus:outline-none focus:ring-2 focus:ring-clay"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="min-h-10 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/35 focus:outline-none focus:ring-2 focus:ring-clay"
          >
            Sign in
          </Link>
        )}
        <Link
          href="/create"
          className="min-h-10 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2"
        >
          Create a gathering
        </Link>
      </nav>
    </header>
  );
}
