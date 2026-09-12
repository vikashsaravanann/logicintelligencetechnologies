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
  const cron = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  const headerSecret = req.headers.get("x-cron-secret") || "";
  if (cron && auth.startsWith("Bearer ") && timingEqual(auth.slice(7), cron)) {
    return { ok: true };
  }
  if (cron && headerSecret && timingEqual(headerSecret, cron)) {
    return { ok: true };
  }

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
    const email = session?.user?.email || "";
    if (email.toLowerCase().endsWith("@logicintelligencetechnologies.in")) {
      return { ok: true };
    }
  } catch {
    /* fall through */
  }

  return { ok: false, status: 401, message: "Unauthorized" };
}
