import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicEnvironment } from "@/lib/env";

function safeNext(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = new URL(safeNext(url.searchParams.get("next")), url.origin);
  if (!code) {
    destination.pathname = "/sign-in";
    destination.searchParams.set("error", "missing_code");
    return NextResponse.redirect(destination);
  }
  try {
    const environment = getPublicEnvironment();
    if (!environment.NEXT_PUBLIC_SUPABASE_URL || !environment.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      throw new Error("Supabase unavailable");
    const response = NextResponse.redirect(destination);
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
  } catch {
    // Deliberately avoid logging codes or auth errors.
  }
  destination.pathname = "/sign-in";
  destination.searchParams.set("error", "link_unavailable");
  return NextResponse.redirect(destination);
}
