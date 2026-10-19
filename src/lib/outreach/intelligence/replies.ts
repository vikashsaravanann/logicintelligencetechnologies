import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ReplyCategory } from "./reply-schema";

export interface ReplyRow {
  id: string;
  business_id: string;
  company_name: string;
  outreach_id: string | null;
  message_id: string | null;
  channel: string;
  from_email: string | null;
  subject: string | null;
  body: string;
  category: ReplyCategory;
  category_confidence: number | null;
  category_rationale: string | null;
  requires_human: boolean;
  handled: boolean;
  handled_by: string | null;
  handled_at: string | null;
  classified_by: string | null;
  received_at: string;
}

/** List replies, newest first, optionally filtered to one category or unhandled only. */
export async function listReplies(opts: { category?: string; unhandledOnly?: boolean; limit?: number } = {}): Promise<ReplyRow[]> {
  let q = supabaseAdmin
    .from("lead_outreach_replies")
    .select(
      "id, business_id, outreach_id, message_id, channel, from_email, subject, body, category, " +
        "category_confidence, category_rationale, requires_human, handled, handled_by, handled_at, " +
        "classified_by, received_at, lead_businesses(company_name)",
    )
    .order("received_at", { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.unhandledOnly) q = q.eq("handled", false);

  const { data, error } = await q;
  if (error || !data) return [];
  return (data as unknown as Array<Record<string, unknown>>).map((m) => ({
    id: m.id as string,
    business_id: m.business_id as string,
    company_name: ((m.lead_businesses as { company_name?: string } | null)?.company_name as string) ?? "—",
    outreach_id: (m.outreach_id as string) ?? null,
    message_id: (m.message_id as string) ?? null,
    channel: m.channel as string,
    from_email: (m.from_email as string) ?? null,
    subject: (m.subject as string) ?? null,
    body: m.body as string,
    category: m.category as ReplyCategory,
    category_confidence: (m.category_confidence as number) ?? null,
    category_rationale: (m.category_rationale as string) ?? null,
    requires_human: Boolean(m.requires_human),
    handled: Boolean(m.handled),
    handled_by: (m.handled_by as string) ?? null,
    handled_at: (m.handled_at as string) ?? null,
    classified_by: (m.classified_by as string) ?? null,
    received_at: m.received_at as string,
  }));
}

export interface RecordReplyInput {
  businessId: string;
  outreachId?: string | null;
  messageId?: string | null;
  channel?: string;
  fromEmail?: string | null;
  subject?: string | null;
  body: string;
  category: ReplyCategory;
  confidence: number | null;
  rationale: string | null;
  requiresHuman: boolean;
  classifiedBy: string;
  provider?: string | null;
  model?: string | null;
  raw?: Record<string, unknown>;
}

/**
 * Append an inbound reply. The DB marks the business replied and (via trigger)
 * cancels any scheduled follow-up for that business. Returns the new id or null.
 */
export async function recordReply(input: RecordReplyInput): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("lead_outreach_replies")
    .insert({
      business_id: input.businessId,
      outreach_id: input.outreachId ?? null,
      message_id: input.messageId ?? null,
      channel: input.channel ?? "email",
      from_email: input.fromEmail ?? null,
      subject: input.subject ?? null,
      body: input.body,
      category: input.category,
      category_confidence: input.confidence,
      category_rationale: input.rationale,
      requires_human: input.requiresHuman,
      classified_by: input.classifiedBy,
      provider: input.provider ?? null,
      model: input.model ?? null,
      raw: input.raw ?? {},
    })
    .select("id")
    .maybeSingle();
  if (error || !data) return null;

  // Reflect the reply on the outreach record when we know which one it answers.
  if (input.outreachId) {
    await supabaseAdmin
      .from("lead_outreach")
      .update({ replied: true, replied_at: new Date().toISOString(), status: "replied" })
      .eq("id", input.outreachId);
  }
  return data.id as string;
}

/** Re-classify a reply (inbound facts stay immutable; only the label changes). */
export async function setReplyCategory(id: string, category: ReplyCategory, by: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("lead_outreach_replies")
    .update({ category, classified_by: by, requires_human: false })
    .eq("id", id);
  return !error;
}

/** Mark a reply handled (a human has actioned it). */
export async function markReplyHandled(id: string, by: string, handled = true): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("lead_outreach_replies")
    .update({ handled, handled_by: handled ? by : null, handled_at: handled ? new Date().toISOString() : null })
    .eq("id", id);
  return !error;
}

/** Counts by category for the Replies header. */
export async function replyCategoryCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin.from("lead_outreach_replies").select("category");
  if (error || !data) return {};
  const out: Record<string, number> = {};
  for (const r of data as Array<{ category: string }>) out[r.category] = (out[r.category] ?? 0) + 1;
  return out;
}
