import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { isStaffRole, hasCapability, type StaffRole, type Capability } from "@/config/roles";
import { recordAdminAction } from "@/lib/admin/audit";

export interface StaffSession {
  userId: string;
  email: string | null;
  role: StaffRole;
}

async function resolveStaff(supabase: SupabaseClient): Promise<StaffSession | null> {
  let userId: string | null = null;
  let email: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    if (data.user.is_anonymous || !data.user.email_confirmed_at) return null;
    userId = data.user.id;
    email = data.user.email ?? null;
  } catch {
    return null;
  }
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !profile || !isStaffRole(profile.role)) return null;
  return { userId, email, role: profile.role };
}

async function serverClient() {
  const cookieStore = await cookies();
  return createServerComponentClient(
    { cookies: () => cookieStore as never },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  );
}

async function routeClient() {
  const cookieStore = await cookies();
  return createRouteHandlerClient(
    { cookies: () => cookieStore as never },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  );
}

/** Signed-in staff member, or null. Server components. */
export async function getStaffSession(): Promise<StaffSession | null> {
  try {
    return await resolveStaff(await serverClient());
  } catch {
    return null;
  }
}

/** Require any staff role for a page. Redirects non-staff. */
export async function requireStaffPage(currentPath: string): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    const supabase = await serverClient();
    const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }) as never);
    if (data?.user && !data.user.is_anonymous) {
      // Signed in but not staff (unconfirmed handled upstream): show why.
      redirect("/profile?notice=admin-required");
    }
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  return session;
}

/** Require a specific capability for a page. Non-capable staff → /admin/forbidden. */
export async function requireCapabilityPage(cap: Capability, currentPath: string): Promise<StaffSession> {
  const session = await requireStaffPage(currentPath);
  if (!hasCapability(session.role, cap)) {
    redirect(`/admin/forbidden?need=${encodeURIComponent(cap)}`);
  }
  return session;
}

/** Require a capability for a server action; audits a denial then throws. */
export async function requireCapabilityAction(cap: Capability, action: string): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session || !hasCapability(session.role, cap)) {
    await recordAdminAction({
      actor: session ? { userId: session.userId, email: session.email, role: session.role } : null,
      action,
      capability: cap,
      outcome: "denied",
    });
    throw new Error("Forbidden: you do not have permission for this action.");
  }
  return session;
}

export type CapabilityApiResult =
  | { ok: true; session: StaffSession }
  | { ok: false; status: number; message: string };

/** Require a capability for an API route. */
export async function requireCapabilityApi(_req: Request, cap: Capability): Promise<CapabilityApiResult> {
  let session: StaffSession | null = null;
  try {
    session = await resolveStaff(await routeClient());
  } catch {
    return { ok: false, status: 503, message: "Authorization service unavailable" };
  }
  if (!session) return { ok: false, status: 401, message: "Unauthorized" };
  if (!hasCapability(session.role, cap)) {
    return { ok: false, status: 403, message: "Forbidden: missing capability" };
  }
  return { ok: true, session };
}
