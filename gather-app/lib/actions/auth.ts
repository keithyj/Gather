"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string };

const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

export async function requestMagicLinkAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success)
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter a valid email address." };

  try {
    const supabase = await createServerSupabaseClient();
    // Do not derive magic-link redirects from a request Host/Origin header.
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: new URL("/auth/callback", origin).toString() }
    });
    if (error) return { error: "We couldn’t send that sign-in link. Please try again." };
    return { success: "Check your email for a sign-in link." };
  } catch {
    return { error: "Sign-in is unavailable until Supabase is configured." };
  }
}
