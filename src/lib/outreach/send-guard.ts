import "server-only";
import { isSuppressed } from "@/lib/email/suppression";
import { isValidEmail, normalizeEmail } from "@/lib/email/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { STOP_LIFECYCLE_STAGES, type LeadLifecycleStage } from "./types";

export type SendGuardResult =
  | { ok: true; email: string }
  | { ok: false; reason: string };

const DEFAULT_COOLDOWN_HOURS = 48;

/**
 * Final marketing send guard — all outreach marketing must pass here.
 */
export async function marketingSendGuard(params: {
  email: string;
  leadId?: string | null;
  cooldownHours?: number;
}): Promise<SendGuardResult> {
  const email = normalizeEmail(params.email);
  if (!isValidEmail(email)) {
    return { ok: false, reason: "invalid_email" };
  }

  if (await isSuppressed(email, "marketing")) {
    return { ok: false, reason: "suppressed" };
  }

  if (isSupabaseLive()) {
    try {
      let query = supabaseAdmin
        .from("contact_leads")
        .select(
          "id, lifecycle_stage, communication_status, last_contacted_at, pipeline_stage"
        )
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (params.leadId) {
        query = supabaseAdmin
          .from("contact_leads")
          .select(
            "id, lifecycle_stage, communication_status, last_contacted_at, pipeline_stage"
          )
          .eq("id", params.leadId)
          .limit(1);
      }

      const { data } = await query.maybeSingle();
      if (data) {
        const stage = String(
          data.lifecycle_stage || data.pipeline_stage || "NEW"
        ).toUpperCase() as LeadLifecycleStage;
        if (STOP_LIFECYCLE_STAGES.includes(stage)) {
          return { ok: false, reason: `lifecycle_${stage.toLowerCase()}` };
        }
        const status = String(data.communication_status || "").toUpperCase();
        if (
          status === "BOUNCED" ||
          status === "COMPLAINT" ||
          status === "UNSUBSCRIBED" ||
          status === "SUPPRESSED"
        ) {
          return { ok: false, reason: `comm_${status.toLowerCase()}` };
        }
        if (data.last_contacted_at) {
          const hours =
            (Date.now() - new Date(data.last_contacted_at).getTime()) /
            (1000 * 60 * 60);
          const cooldown = params.cooldownHours ?? DEFAULT_COOLDOWN_HOURS;
          if (hours < cooldown) {
            return { ok: false, reason: "cooldown" };
          }
        }
      }
    } catch {
      return { ok: false, reason: "lead_lookup_failed" };
    }
  }

  return { ok: true, email };
}
