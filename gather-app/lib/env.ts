import { z } from "zod";

const publicEnvironmentFields = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional()
});

const publicEnvironment = publicEnvironmentFields.refine(
  (value) => Boolean(value.NEXT_PUBLIC_SUPABASE_URL) === Boolean(value.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  "Set both public Supabase variables, or neither while using the local mock."
);

export function getPublicEnvironment(environment: Partial<NodeJS.ProcessEnv> = process.env) {
  return publicEnvironment.parse({
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: environment.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined
  });
}

const serverEnvironment = publicEnvironmentFields
  .extend({
    EVENT_DETAILS_ENCRYPTION_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional()
  })
  .refine(
    (value) => Boolean(value.NEXT_PUBLIC_SUPABASE_URL) === Boolean(value.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    "Set both public Supabase variables together."
  );

export function getServerEnvironment(environment: Partial<NodeJS.ProcessEnv> = process.env) {
  return serverEnvironment.parse({
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: environment.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
    EVENT_DETAILS_ENCRYPTION_KEY: environment.EVENT_DETAILS_ENCRYPTION_KEY || undefined,
    NEXT_PUBLIC_SITE_URL: environment.NEXT_PUBLIC_SITE_URL || undefined
  });
}

export function isSupabaseConfigured(environment: Partial<NodeJS.ProcessEnv> = process.env) {
  return getPublicEnvironment(environment).NEXT_PUBLIC_SUPABASE_URL !== undefined;
}
