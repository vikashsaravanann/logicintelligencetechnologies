import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { env } from "@/config/env";

export type AdminApiAuth =
  | { ok: true; userId: string; email: string | null; role: string }
  | { ok: false; status: number; message: string };

const COMPANY_DOMAIN = "@logicintelligencetechnologies.in";

/** Company accounts are the admin population; the middleware uses the same rule for /admin and /dashboard. */
export function isCompanyAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase().endsWith(COMPANY_DOMAIN));
}

/**
 * Resolves the signed-in user with getUser(), which validates the access token
 * with Supabase Auth instead of trusting the session cookie as getSession() does.
 *
 * profiles.role is deliberately NOT consulted: that column is writable by its
 * owner under the current RLS policy, so trusting it would let any user promote
 * themselves. Restore a role check only after the profiles update policy pins
 * the role column (see supabase/migrations/*_harden_rls.sql).
 */
async function resolveAdmin(supabase: SupabaseClient): Promise<AdminApiAuth> {
  let user: User | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data.user;
  } catch (error) {
    console.error("[require-admin] auth lookup failed:", error);
  }
  if (!user) return { ok: false, status: 401, message: "Unauthorized" };
  if (!isCompanyAdminEmail(user.email)) {
    return { ok: false, status: 403, message: "Forbidden: Admin access required" };
  }
  return { ok: true, userId: user.id, email: user.email ?? null, role: "company_admin" };
}

async function routeClient() {
  const cookieStore = await cookies();
  return createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  );
}

/** Route handlers: returns a result the caller turns into a 401/403 response. */
export async function requireAdminApi(_req?: Request): Promise<AdminApiAuth> {
  return resolveAdmin(await routeClient());
}

/** Server actions: throws so the action never runs for a non-admin caller. */
export async function requireAdminAction(): Promise<Extract<AdminApiAuth, { ok: true }>> {
  const auth = await resolveAdmin(await routeClient());
  if (!auth.ok) throw new Error(auth.message);
  return auth;
}

/** Server component layouts: redirects instead of rendering admin UI. */
export async function requireAdminPage(currentPath: string): Promise<Extract<AdminApiAuth, { ok: true }>> {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  );
  const auth = await resolveAdmin(supabase);
  if (!auth.ok) {
    redirect(auth.status === 401 ? `/login?next=${encodeURIComponent(currentPath)}` : "/profile");
  }
  return auth;
}
