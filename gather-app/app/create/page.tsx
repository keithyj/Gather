import { EventForm } from "@/components/event-form";
import { SiteHeader } from "@/components/site-header";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CreatePage() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in?next=/create");
  }
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-7 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-moss">Housewarming template</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-none sm:text-6xl">
          Start with a good welcome.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-7 text-ink/65">
          A calm first draft for a private dinner. You can shape the invitation before anyone sees it.
        </p>
        <div className="mt-10">
          <EventForm />
        </div>
      </div>
    </main>
  );
}
