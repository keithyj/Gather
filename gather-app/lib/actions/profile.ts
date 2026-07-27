"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ProfileActionState = { error?: string; success?: string };

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Add a display name.").max(80),
  pronouns: z.string().trim().max(80).optional(),
  ageOver18: z.literal(true, { errorMap: () => ({ message: "Gather is for adults aged 18 and over." }) })
});

export async function updateProfileAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    pronouns: formData.get("pronouns") || undefined,
    ageOver18: formData.get("ageOver18") === "on"
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your profile details." };

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in to update your profile." };
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.displayName,
        pronouns: parsed.data.pronouns || null,
        age_over_18: true
      })
      .eq("id", user.id);
    if (error) return { error: "We couldn’t save your profile. Please try again." };
    revalidatePath("/account");
    return { success: "Profile saved." };
  } catch {
    return { error: "Profiles are unavailable until Supabase is configured." };
  }
}
