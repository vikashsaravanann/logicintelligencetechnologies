import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";

export type PersistOk = { ok: true; id: string };
export type PersistFail = { ok: false; message: string };
export type PersistResult = PersistOk | PersistFail;

const USER_DB_ERROR =
  "We could not save your request just now. Please try again, or message us on WhatsApp.";

/**
 * Database is mandatory for public lead forms in production.
 * Email must never report success when the lead was not stored.
 */
export function requireDatabase(): PersistFail | null {
  if (!isSupabaseLive()) {
    console.error("[forms] Supabase is not configured — refusing to accept lead.");
    return { ok: false, message: USER_DB_ERROR };
  }
  return null;
}

export async function insertLead(
  table: string,
  row: Record<string, unknown>
): Promise<PersistResult> {
  const missing = requireDatabase();
  if (missing) return missing;

  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .insert([row])
      .select("id")
      .maybeSingle();

    if (error || !data?.id) {
      console.error(`[forms] insert failed on ${table}:`, error);
      return { ok: false, message: USER_DB_ERROR };
    }
    return { ok: true, id: String(data.id) };
  } catch (err) {
    console.error(`[forms] insert exception on ${table}:`, err);
    return { ok: false, message: USER_DB_ERROR };
  }
}

export function jsonFail(message: string, status: number) {
  return { body: { success: false as const, message }, status };
}

export function jsonOk(message: string, extra: Record<string, unknown> = {}) {
  return { body: { success: true as const, message, ...extra }, status: 200 };
}
