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

/**
 * Checks suppression across both email_suppressions and lead_suppressions tables.
 */
export async function isSuppressed(
  email: string,
  category: "marketing" | "transactional" | "security" | "operational"
): Promise<boolean> {
  if (category === "security") return false;
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !isSupabaseLive()) return false;

  try {
    const [esRes, lsRes] = await Promise.all([
      supabaseAdmin
        .from("email_suppressions")
        .select("reason")
        .eq("email", normalized)
        .maybeSingle(),
      supabaseAdmin
        .from("lead_suppressions")
        .select("reason")
        .eq("email", normalized)
        .eq("active", true)
        .limit(1),
    ]);

    const esData = esRes.data;
    const lsData = lsRes.data;

    const hasEs = Boolean(esData);
    const hasLs = Boolean(lsData && lsData.length > 0);

    if (!hasEs && !hasLs) return false;
    if (category === "marketing") return true;

    const esReason = esData?.reason;
    const lsReason = lsData?.[0]?.reason;
    return (
      esReason === "bounce" ||
      esReason === "complaint" ||
      esReason === "invalid" ||
      lsReason === "bounce" ||
      lsReason === "complaint"
    );
  } catch (err) {
    emailLog("warn", "suppression_lookup_failed", {
      recipient: maskEmail(normalized),
      message: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Universally suppresses an email across all system datasets.
 */
export async function suppressEmail(
  email: string,
  reason: SuppressionReason,
  source = "app"
): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !isSupabaseLive()) return;
  try {
    // 1. email_suppressions
    await supabaseAdmin.from("email_suppressions").upsert(
      {
        email: normalized,
        reason,
        source,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    // 2. lead_suppressions
    const leadReason =
      reason === "bounce" || reason === "complaint"
        ? reason
        : reason === "unsubscribe"
          ? "opt_out"
          : "manual";

    try {
      await supabaseAdmin.from("lead_suppressions").insert({
        email: normalized,
        reason: leadReason,
        scope: "global",
        source: `sync:${source}`,
        active: true,
      });
    } catch {
      // Conflict or sync trigger handled
    }

    // 3. Sync to contact_leads
    try {
      await supabaseAdmin
        .from("contact_leads")
        .update({
          communication_status: reason === "unsubscribe" ? "UNSUBSCRIBED" : reason.toUpperCase(),
        })
        .eq("email", normalized);
    } catch {
      // Non-fatal if contact_leads doesn't have matching row
    }

    // 4. Opt-out from newsletter and profiles
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
    await Promise.all([
      supabaseAdmin
        .from("email_suppressions")
        .delete()
        .eq("email", normalized)
        .eq("reason", "unsubscribe"),
      supabaseAdmin
        .from("lead_suppressions")
        .update({ active: false })
        .eq("email", normalized)
        .eq("reason", "opt_out"),
    ]);
  } catch {
    /* non-fatal */
  }
}
