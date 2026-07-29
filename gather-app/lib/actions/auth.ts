"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { signInErrorMessage } from "@/lib/auth-errors";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PasswordSignInResult = { error?: string; success?: true };
export type UsernameAvailabilityResult = { available?: true; error?: string };

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

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,24}$/);

export async function checkUsernameAvailabilityAction(username: string): Promise<UsernameAvailabilityResult> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return { error: "Use 3–24 lowercase letters, numbers, or underscores for your username." };
  }
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from("profiles").select("id").ilike("username", parsed.data).limit(1);
    if (error) return { error: "Username availability is temporarily unavailable." };
    if (data?.length) return { error: "That username is already taken." };
    return { available: true };
  } catch {
    return { error: "Username availability is temporarily unavailable." };
  }
}

export async function signInWithPasswordAction(
  input: z.infer<typeof passwordSignInSchema>
): Promise<PasswordSignInResult> {
  const parsed = passwordSignInSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter your email or username and password." };
  try {
    const identifier = parsed.data.identifier.toLowerCase();
    const usedUsername = !identifier.includes("@");
    let email = identifier;
    if (usedUsername) {
      const admin = createAdminSupabaseClient();
      const { data, error } = await admin.rpc("resolve_login_email_by_username", { p_username: identifier });
      if (error || !data) return { error: signInErrorMessage({ code: "invalid_credentials" }, true) };
      email = data as string;
    }
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
    if (error) return { error: signInErrorMessage(error, usedUsername) };
    return { success: true };
  } catch {
    return {
      error: "Password sign-in is temporarily unavailable. Try your email address or contact support."
    };
  }
}
