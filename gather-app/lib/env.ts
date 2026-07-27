import { z } from "zod";

const publicEnvironmentInput = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional()
});

const publicEnvironment = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional()
  })
  .refine(
    (value) => Boolean(value.NEXT_PUBLIC_SUPABASE_URL) === Boolean(value.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    "Set both public Supabase variables, or neither while using the local mock."
  );

export function getPublicEnvironment(environment: Partial<NodeJS.ProcessEnv> = process.env) {
  const configured = publicEnvironmentInput.parse({
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: environment.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined
  });
  if (
    configured.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    configured.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    configured.NEXT_PUBLIC_SUPABASE_ANON_KEY !== configured.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error("Set only one Supabase public key, or use the same value for both names.");
  }
  return publicEnvironment.parse({
    NEXT_PUBLIC_SUPABASE_URL: configured.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      configured.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? configured.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
}

const serverEnvironment = z.object({
  EVENT_DETAILS_ENCRYPTION_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional()
});

export function getServerEnvironment(environment: Partial<NodeJS.ProcessEnv> = process.env) {
  return {
    ...getPublicEnvironment(environment),
    ...serverEnvironment.parse({
      EVENT_DETAILS_ENCRYPTION_KEY: environment.EVENT_DETAILS_ENCRYPTION_KEY || undefined,
      NEXT_PUBLIC_SITE_URL: environment.NEXT_PUBLIC_SITE_URL || undefined
    })
  };
}

const adminEnvironment = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

export function getAdminEnvironment(environment: Partial<NodeJS.ProcessEnv> = process.env) {
  return {
    ...getPublicEnvironment(environment),
    ...adminEnvironment.parse({
      SUPABASE_SERVICE_ROLE_KEY: environment.SUPABASE_SERVICE_ROLE_KEY || undefined
    })
  };
}

export function isSupabaseConfigured(environment: Partial<NodeJS.ProcessEnv> = process.env) {
  return getPublicEnvironment(environment).NEXT_PUBLIC_SUPABASE_URL !== undefined;
}
