import "server-only";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import crypto from "crypto";

function timingEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  try {
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function requireAdminApi(
  req: Request
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {

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
      // Fetch profile to verify role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
        
      if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
        return { ok: true };
      }
    }
  } catch (error) {
    console.error("[requireAdminApi] Auth check failed:", error);
  }

  return { ok: false, status: 403, message: "Forbidden: Admin access required" };
}
