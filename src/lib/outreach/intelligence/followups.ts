import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface FollowupRow {
  id: string;
  business_id: string;
  company_name: string;
  outreach_id: string | null;
  message_id: string | null;
  sequence_step: number;
  due_at: string;
  status: string;
  reason: string | null;
  resolution: string | null;
  created_by: string | null;
  cancelled_by: string | null;
  sent_at: string | null;
  created_at: string;
}

function mapRows(data: unknown): FollowupRow[] {
  return (data as Array<Record<string, unknown>>).map((m) => ({
    id: m.id as string,
    business_id: m.business_id as string,
    company_name: ((m.lead_businesses as { company_name?: string } | null)?.company_name as string) ?? "—",
    outreach_id: (m.outreach_id as string) ?? null,
    message_id: (m.message_id as string) ?? null,
    sequence_step: (m.sequence_step as number) ?? 1,
    due_at: m.due_at as string,
    status: m.status as string,
    reason: (m.reason as string) ?? null,
    resolution: (m.resolution as string) ?? null,
    created_by: (m.created_by as string) ?? null,
    cancelled_by: (m.cancelled_by as string) ?? null,
    sent_at: (m.sent_at as string) ?? null,
    created_at: m.created_at as string,
  }));
}

const SELECT =
  "id, business_id, outreach_id, message_id, sequence_step, due_at, status, reason, resolution, " +
  "created_by, cancelled_by, sent_at, created_at, lead_businesses(company_name)";

/** List follow-ups filtered by status, soonest-due first. */
export async function listFollowups(statuses: string[] = ["scheduled"], limit = 100): Promise<FollowupRow[]> {
  const { data, error } = await supabaseAdmin
    .from("lead_outreach_followups")
    .select(SELECT)
    .in("status", statuses)
    .order("due_at", { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return mapRows(data);
}

export interface ScheduleFollowupInput {
  businessId: string;
  outreachId?: string | null;
  messageId?: string | null;
  dueAt: string; // ISO
  reason?: string | null;
  sequenceStep?: number;
  createdBy: string;
}

export type ScheduleResult = { ok: boolean; id?: string; message: string };

/**
 * Schedule a follow-up. At most one scheduled follow-up may exist per business
 * (DB unique index). If one already exists, this reschedules it rather than
 * creating a duplicate chase.
 */
export async function scheduleFollowup(input: ScheduleFollowupInput): Promise<ScheduleResult> {
  const { data: existing } = await supabaseAdmin
    .from("lead_outreach_followups")
    .select("id")
    .eq("business_id", input.businessId)
    .eq("status", "scheduled")
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("lead_outreach_followups")
      .update({ due_at: input.dueAt, reason: input.reason ?? null, created_by: input.createdBy })
      .eq("id", existing.id as string);
    if (error) return { ok: false, message: "Could not reschedule the existing follow-up." };
    return { ok: true, id: existing.id as string, message: "Existing follow-up rescheduled." };
  }

  const { data, error } = await supabaseAdmin
    .from("lead_outreach_followups")
    .insert({
      business_id: input.businessId,
      outreach_id: input.outreachId ?? null,
      message_id: input.messageId ?? null,
      due_at: input.dueAt,
      reason: input.reason ?? null,
      sequence_step: input.sequenceStep ?? 1,
      created_by: input.createdBy,
    })
    .select("id")
    .maybeSingle();
  if (error || !data) return { ok: false, message: "Could not schedule the follow-up." };
  return { ok: true, id: data.id as string, message: "Follow-up scheduled." };
}

/** Cancel a scheduled follow-up. */
export async function cancelFollowup(id: string, by: string, resolution?: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("lead_outreach_followups")
    .update({ status: "cancelled", cancelled_by: by, resolution: resolution ?? "Cancelled by staff" })
    .eq("id", id)
    .eq("status", "scheduled");
  return !error;
}

/** Mark a follow-up sent (the chase went out). */
export async function markFollowupSent(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("lead_outreach_followups")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "scheduled");
  return !error;
}

/** Counts by status + how many are overdue, for the Follow-Ups header. */
export async function followupStats(): Promise<{ byStatus: Record<string, number>; overdue: number }> {
  const { data, error } = await supabaseAdmin.from("lead_outreach_followups").select("status, due_at");
  if (error || !data) return { byStatus: {}, overdue: 0 };
  const byStatus: Record<string, number> = {};
  let overdue = 0;
  const now = Date.now();
  for (const r of data as Array<{ status: string; due_at: string }>) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    if (r.status === "scheduled" && new Date(r.due_at).getTime() < now) overdue++;
  }
  return { byStatus, overdue };
}
