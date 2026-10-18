import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type StaffNotificationEventType =
  | "project.assigned"
  | "project.reassigned"
  | "project.revoked"
  | "client.message"
  | "client.support_ticket"
  | "client.change_request"
  | "client.meeting"
  | "quotation.draft_saved"
  | "quotation.submitted"
  | "quotation.review_feedback"
  | "invoice.prep_saved"
  | "invoice.prep_submitted"
  | "invoice.prep_reviewed"
  | "stage.updated"
  | "document.review"
  | "task.assigned"
  | "security.alert"
  | "system";

export type NotifyStaffInput = {
  recipientUserId: string;
  eventType: StaffNotificationEventType;
  title: string;
  summary?: string | null;
  engagementId?: string | null;
  sourceId?: string | null;
  actionUrl?: string | null;
  /** When set, duplicate inserts with the same key are ignored */
  idempotencyKey?: string | null;
};

/**
 * Persist a staff_notifications row. Failures are logged and never throw
 * into the primary business transaction path unless throwOnError is set.
 */
export async function notifyStaff(
  input: NotifyStaffInput,
  options?: { throwOnError?: boolean }
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!input.recipientUserId) {
    return { ok: false, error: "missing recipient" };
  }

  const row = {
    recipient_user_id: input.recipientUserId,
    engagement_id: input.engagementId || null,
    event_type: input.eventType,
    title: input.title.slice(0, 200),
    summary: input.summary ? String(input.summary).slice(0, 500) : null,
    source_id: input.sourceId || null,
    action_url: input.actionUrl || "/staff/dashboard",
    idempotency_key: input.idempotencyKey || null,
  };

  const { data, error } = await supabaseAdmin
    .from("staff_notifications")
    .insert(row)
    .select("id")
    .maybeSingle();

  if (error) {
    // Unique idempotency conflict is success
    if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
      return { ok: true };
    }
    console.warn("[staff_notifications]", error.message);
    if (options?.throwOnError) throw new Error(error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id };
}

/** Notify all active staff assigned to an engagement. */
export async function notifyAssignedStaffForEngagement(
  engagementId: string,
  event: Omit<NotifyStaffInput, "recipientUserId" | "engagementId"> & {
    engagementId?: string;
  }
): Promise<number> {
  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("staff_user_id, expires_at, status")
    .eq("engagement_id", engagementId)
    .eq("status", "active");

  const recipients = (assignments || [])
    .filter((a) => a.staff_user_id && (!a.expires_at || new Date(a.expires_at).getTime() > Date.now()))
    .map((a) => a.staff_user_id as string);

  let count = 0;
  for (const uid of [...new Set(recipients)]) {
    const res = await notifyStaff({
      ...event,
      recipientUserId: uid,
      engagementId,
      actionUrl:
        event.actionUrl ||
        `/staff/projects/${engagementId}`,
    });
    if (res.ok) count += 1;
  }
  return count;
}

/** Resolve staff user ids assigned to engagements matching a client email. */
export async function resolveStaffUserIdsForClientEmail(clientEmail: string): Promise<
  { userId: string; engagementId: string | null }[]
> {
  const email = clientEmail.trim().toLowerCase();
  if (!email) return [];

  const { data: engs } = await supabaseAdmin
    .from("client_engagements")
    .select("id, contact_email")
    .ilike("contact_email", email)
    .limit(20);

  const engIds = (engs || []).map((e) => e.id as string);
  if (!engIds.length) return [];

  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("staff_user_id, engagement_id, status, expires_at")
    .in("engagement_id", engIds)
    .eq("status", "active");

  const out: { userId: string; engagementId: string | null }[] = [];
  for (const a of assignments || []) {
    if (!a.staff_user_id) continue;
    if (a.expires_at && new Date(a.expires_at).getTime() <= Date.now()) continue;
    out.push({ userId: a.staff_user_id, engagementId: a.engagement_id || null });
  }
  return out;
}
