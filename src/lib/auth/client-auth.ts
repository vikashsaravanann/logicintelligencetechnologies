import "server-only";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import { env } from "@/config/env";

export interface VerifiedClient {
  user: User;
  email: string;
}

/**
 * Validates the authenticated client caller strictly via Supabase Auth (remote getUser()).
 * Rejects anonymous callers, unauthenticated requests, and never falls back to
 * unverified request headers (such as x-client-email) or query parameters.
 */
export async function getVerifiedClientUser(): Promise<VerifiedClient | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;
    if (error || !user || user.is_anonymous || !user.email) {
      return null;
    }
    return {
      user,
      email: user.email.trim().toLowerCase(),
    };
  } catch (err) {
    console.warn("[client-auth] Failed to verify client session:", err);
    return null;
  }
}
