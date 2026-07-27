import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getAdminEnvironment } from "@/lib/env";

/** Server-only administrative client used solely to resolve a username for password sign-in. */
export function createAdminSupabaseClient() {
  const environment = getAdminEnvironment();
  return createClient(environment.NEXT_PUBLIC_SUPABASE_URL!, environment.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
