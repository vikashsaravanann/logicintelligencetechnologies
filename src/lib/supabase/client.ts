import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Browser-side Supabase client.
 * Uses the public anon key only — safe for client components.
 * DO NOT use for operations that require elevated privileges.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-domain.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy";

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Client component client helper with safe fallback during static build prerendering.
 */
export function getClientSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-domain.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy";
  return createClientComponentClient({
    supabaseUrl: url,
    supabaseKey: key,
  });
}

