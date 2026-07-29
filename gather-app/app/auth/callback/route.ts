import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { confirmationErrorKind } from "@/lib/auth-errors";
import { getPublicEnvironment } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function privateRedirect(destination: URL) {
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("X-Robots-Tag", "noindex, noarchive");
  return response;
}

function safeNext(next: string | null) {
  if (!next) return "/account";
  const base = "https://gather.invalid";
  const destination = new URL(next, base);
  return destination.origin === base
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : "/account";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = new URL(safeNext(url.searchParams.get("next")), url.origin);
  const providerError = url.searchParams.get("error_code") ?? undefined;
  if (!code) {
    destination.pathname = "/sign-in";
    destination.searchParams.set(
      "error",
      providerError ? confirmationErrorKind(providerError) : "missing_code"
    );
    return privateRedirect(destination);
  }
  try {
    const environment = getPublicEnvironment();
    if (!environment.NEXT_PUBLIC_SUPABASE_URL || !environment.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      throw new Error("Supabase unavailable");
    const response = privateRedirect(destination);
    const cookieStore = await cookies();
    const supabase = createServerClient(
      environment.NEXT_PUBLIC_SUPABASE_URL,
      environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          }
        }
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
    destination.pathname = "/sign-in";
    destination.searchParams.set("error", confirmationErrorKind(error.code));
    return privateRedirect(destination);
  } catch {
    // Deliberately avoid logging codes or auth errors.
  }
  destination.pathname = "/sign-in";
  destination.searchParams.set("error", "confirmation_unavailable");
  return privateRedirect(destination);
}
