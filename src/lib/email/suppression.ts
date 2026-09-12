import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "./config";
import { normalizeEmail, isValidEmail } from "./validation";
import { emailLog, maskEmail } from "./logger";

export type SuppressionReason =
  | "unsubscribe"
  | "bounce"
  | "complaint"
  | "manual"
  | "invalid";

export async function isSuppressed(
  email: string,
  category: "marketing" | "transactional" | "security" | "operational"
): Promise<boolean> {
  if (category === "security") return false;
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !isSupabaseLive()) return false;

  try {
    const { data, error } = await supabaseAdmin
      .from("email_suppressions")
      .select("reason")
      .eq("email", normalized)
      .maybeSingle();
    if (error) {
      emailLog("warn", "suppression_lookup_failed", {
        recipient: maskEmail(normalized),
      });
      return false;
    }
    if (!data) return false;
    if (category === "marketing") return true;
    return data.reason === "bounce" || data.reason === "complaint" || data.reason === "invalid";
  } catch {
    return false;
  }
}

export async function suppressEmail(
  email: string,
  reason: SuppressionReason,
  source = "app"
): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !isSupabaseLive()) return;
  try {
    await supabaseAdmin.from("email_suppressions").upsert(
      {
        email: normalized,
        reason,
        source,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
    if (reason === "unsubscribe") {
      await supabaseAdmin
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("email", normalized);
      await supabaseAdmin
        .from("profiles")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("email", normalized);
    }
  } catch (err) {
    emailLog("error", "suppress_failed", {
      recipient: maskEmail(normalized),
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function canSubscribe(email: string): Promise<{
  ok: boolean;
  message?: string;
}> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return { ok: false, message: "Enter a valid email address." };
  if (!isSupabaseLive()) return { ok: true };
  try {
    const { data } = await supabaseAdmin
      .from("email_suppressions")
      .select("reason")
      .eq("email", normalized)
      .maybeSingle();
    if (!data) return { ok: true };
    if (data.reason === "unsubscribe") return { ok: true };
    return { ok: false, message: "This address cannot be subscribed." };
  } catch {
    return { ok: true };
  }
}

export async function clearUnsubscribe(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !isSupabaseLive()) return;
  try {
    await supabaseAdmin
      .from("email_suppressions")
      .delete()
      .eq("email", normalized)
      .eq("reason", "unsubscribe");
  } catch {
    /* non-fatal */
  }
}
