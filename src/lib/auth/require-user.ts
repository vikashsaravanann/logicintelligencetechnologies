import "server-only";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

/** Remote token validation; never authorize using a decoded session cookie. */
export async function requireVerifiedUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    );
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;
    if (error || !user || user.is_anonymous || !user.email || !user.email_confirmed_at) return null;
    return user;
  } catch {
    return null;
  }
}