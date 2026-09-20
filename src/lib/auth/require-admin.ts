import "server-only";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

export type AdminApiAuth =
  | { ok: true; userId: string; email: string | null; role: string }
  | { ok: false; status: number; message: string };

/**
 * Human admin only. Does NOT accept CRON_SECRET.
 * Cron/machine callers must use dedicated secret checks on their own routes.
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

    if (session?.user?.id) {
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
          email: session.user.email ?? null,
          role: profile.role,
        };
      }
    }
  } catch (error) {
    console.error("[requireAdminApi] Auth check failed:", error);
  }

  return { ok: false, status: 403, message: "Forbidden: Admin access required" };
}
