import "server-only";
import { cookies } from "next/headers";
import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

export const SUPER_ADMIN_EMAILS = [
  "createwithvikash@gmail.com",
  "vikash@logicintelligencetechnologies.in",
  "founder@logicintelligencetechnologies.in",
  "admin@logicintelligencetechnologies.in",
  "hello@logicintelligencetechnologies.in",
  "platform_owner@healthcare.lit",
];

/**
 * Server-side check if the currently authenticated session belongs to a Super Admin.
 * Verifies email against allowlist or database profile role === 'super_admin'.
 * Fails safely and returns false on error or unauthenticated state.
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return false;
    if (user.is_anonymous || !user.email_confirmed_at) return false;

    if (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true;
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile) return false;
    return profile.role === "super_admin";
  } catch {
    return false;
  }
}

/**
 * Route handler check for API requests.
 */
export async function isRouteCallerSuperAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return false;
    if (user.is_anonymous || !user.email_confirmed_at) return false;

    if (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role === "super_admin";
  } catch {
    return false;
  }
}
