import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";

export type LiveState = "PASS" | "FAIL" | "NOT CONFIGURED";

export interface LiveCheck {
  state: LiveState;
  note?: string;
  latencyMs?: number;
}

/**
 * A real database round-trip (not just an env-var presence check). Runs a tiny
 * head query against profiles. Used by /api/health to decide a true 503 and by
 * /admin/status to show a live result.
 */
export async function checkDatabase(): Promise<LiveCheck> {
  if (!isSupabaseLive()) {
    return { state: "NOT CONFIGURED", note: "Supabase env vars missing or placeholder" };
  }
  const started = Date.now();
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    const latencyMs = Date.now() - started;
    if (error) return { state: "FAIL", note: error.message, latencyMs };
    return { state: "PASS", latencyMs };
  } catch (err) {
    return { state: "FAIL", note: err instanceof Error ? err.message : "query failed" };
  }
}
