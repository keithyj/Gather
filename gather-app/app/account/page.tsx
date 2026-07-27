import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { SiteHeader } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper p-5">
        <div className="max-w-md rounded-3xl border border-clay/25 bg-white p-6">
          <h1 className="font-display text-3xl">Profile setup is unavailable</h1>
          <p className="mt-3 leading-6 text-ink/65">
            Configure Supabase before signing in or saving a profile.
          </p>
        </div>
      </main>
    );
  }
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, pronouns, age_over_18")
    .eq("id", user.id)
    .maybeSingle();
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-5 py-14">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Your profile</p>
        <h1 className="mt-3 font-display text-5xl leading-none">A little context goes a long way.</h1>
        <p className="mt-5 leading-7 text-ink/65">
          Your display name is shared only within your private invitation and event contexts.
        </p>
        <ProfileForm
          displayName={profile?.display_name ?? "Gather guest"}
          pronouns={profile?.pronouns ?? null}
          ageOver18={profile?.age_over_18 ?? false}
        />
      </section>
    </main>
  );
}
