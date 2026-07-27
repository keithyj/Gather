import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(destination);
  } catch {
    // Deliberately avoid logging codes or auth errors.
  }
  destination.pathname = "/sign-in";
  destination.searchParams.set("error", "link_unavailable");
  return NextResponse.redirect(destination);
}
