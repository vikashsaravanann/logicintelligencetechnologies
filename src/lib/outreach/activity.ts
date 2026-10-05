import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";

export async function recordLeadActivity(params: {
  leadId?: string | null;
  email?: string | null;
  eventType: string;
  campaignId?: string | null;
  enrollmentId?: string | null;
  actor?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!isSupabaseLive()) return;
  try {
    await supabaseAdmin.from("lead_activity_events").insert({
      lead_id: params.leadId || null,
      email: params.email || null,
      event_type: params.eventType,
      campaign_id: params.campaignId || null,
      enrollment_id: params.enrollmentId || null,
      actor: params.actor || null,
      metadata: params.metadata || {},
    });
  } catch {
    /* non-fatal */
  }
}
