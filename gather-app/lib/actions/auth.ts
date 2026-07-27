"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string };
export type PasswordSignInResult = { error?: string; success?: true };

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
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
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

export async function signOutAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Redirect to a safe public route even when an expired session cannot be cleared remotely.
  }
  redirect("/");
}

const passwordSignInSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(10).max(128)
});

export async function signInWithPasswordAction(
  input: z.infer<typeof passwordSignInSchema>
): Promise<PasswordSignInResult> {
  const parsed = passwordSignInSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter your email or username and password." };
  try {
    const identifier = parsed.data.identifier.toLowerCase();
    let email = identifier;
    if (!identifier.includes("@")) {
      const admin = createAdminSupabaseClient();
      const { data, error } = await admin.rpc("resolve_login_email_by_username", { p_username: identifier });
      if (error || !data) return { error: "That username or password is not recognised." };
      email = data as string;
    }
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
    if (error) return { error: "That email, username, or password is not recognised." };
    return { success: true };
  } catch {
    return {
      error: "Password sign-in is temporarily unavailable. Try your email address or contact support."
    };
  }
}
