import "server-only";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

export type AdminApiAuth =
  | { ok: true; userId: string; email: string | null; role: string }
  | { ok: false; status: number; message: string };

function isCompanyEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

/**
 * Human admin only. Does NOT accept CRON_SECRET.
 * Matches middleware:
 * - @logicintelligencetechnologies.in email → allowed
 * - OR profiles.role in admin | super_admin
 */
export async function requireAdminApi(
  _req: Request
): Promise<AdminApiAuth> {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return { ok: false, status: 401, message: "Unauthorized" };
    }

    const email = session.user.email ?? null;

    if (isCompanyEmail(email)) {
      return {
        ok: true,
        userId: session.user.id,
        email,
        role: "company_admin",
      };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("[requireAdminApi] profile lookup failed:", error.message);
    }

    if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
      return {
        ok: true,
        userId: session.user.id,
        email,
        role: profile.role,
      };
    }
  } catch (error) {
    console.error("[requireAdminApi] Auth check failed:", error);
  }

  return { ok: false, status: 403, message: "Forbidden: Admin access required" };
}
