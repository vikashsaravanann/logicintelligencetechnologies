import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "./config";
import { EMAIL_MAX_ATTEMPTS, isExhausted, nextAttemptAt } from "./retry";
import { emailLog, maskEmail } from "./logger";
import type { EmailCategory, EmailDeliveryStatus, EmailErrorCategory } from "./types";

export type OutboxInsert = {
  eventType: string;
  templateKey?: string;
  category: EmailCategory;
  recipient: string;
  sender: string;
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  idempotencyKey: string;
  correlationId?: string;
};

export type OutboxRow = {
  id: string;
  status: EmailDeliveryStatus;
  attempt_count: number;
  idempotency_key: string;
  recipient: string;
  sender: string;
  reply_to: string | null;
  subject: string;
  html: string | null;
  text: string | null;
  category: EmailCategory;
  event_type: string;
  provider_message_id: string | null;
};

export type EnqueueEmailParams = {
  recipient: string;
  subject: string;
  templateId?: string;
  category?: EmailCategory;
  sender?: string;
  replyTo?: string;
  html?: string;
  text?: string;
  idempotencyKey?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
};

export async function enqueueEmail(
  params: EnqueueEmailParams
): Promise<{ id: string; duplicate: boolean; alreadySent: boolean } | null> {
  const category: EmailCategory = params.category || "transactional";
  const idempotencyKey =
    params.idempotencyKey ||
    `enqueue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const sender = params.sender || "no-reply@logicintelligencetechnologies.in";

  return await claimOutbox({
    eventType: params.templateId || "general_notification",
    templateKey: params.templateId,
    category,
    recipient: params.recipient,
    sender,
    replyTo: params.replyTo,
    subject: params.subject,
    html:
      params.html ||
      (params.metadata
        ? `<p>${params.subject}</p><pre>${JSON.stringify(params.metadata, null, 2)}</pre>`
        : `<p>${params.subject}</p>`),
    text: params.text,
    idempotencyKey,
    correlationId: params.correlationId,
  });
}

export async function claimOutbox(
  input: OutboxInsert
): Promise<{ id: string; duplicate: boolean; alreadySent: boolean } | null> {
  if (!isSupabaseLive()) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from("email_outbox")
      .insert({
        event_type: input.eventType,
        template_key: input.templateKey || null,
        category: input.category,
        recipient: input.recipient,
        sender: input.sender,
        reply_to: input.replyTo || null,
        subject: input.subject,
        html: input.html || null,
        text: input.text || null,
        idempotency_key: input.idempotencyKey,
        correlation_id: input.correlationId || null,
        status: "processing",
        attempt_count: 1,
        next_attempt_at: new Date().toISOString(),
      })
      .select("id, status")
      .single();

    if (!error && data) {
      return { id: data.id as string, duplicate: false, alreadySent: false };
    }

    if (error && (error.code === "23505" || /duplicate/i.test(error.message || ""))) {
      const existing = await supabaseAdmin
        .from("email_outbox")
        .select("id, status")
        .eq("idempotency_key", input.idempotencyKey)
        .maybeSingle();
      const status = (existing.data?.status || "") as EmailDeliveryStatus;
      return {
        id: (existing.data?.id as string) || "",
        duplicate: true,
        alreadySent: status === "sent",
      };
    }

    emailLog("warn", "outbox_insert_failed", {
      message: error?.message?.slice(0, 180),
      recipient: maskEmail(input.recipient),
    });
    return null;
  } catch (err) {
    emailLog("warn", "outbox_unavailable", {
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function markOutboxSent(
  id: string,
  providerMessageId?: string,
  fallbackUsed = false
): Promise<void> {
  if (!isSupabaseLive() || !id) return;
  await supabaseAdmin
    .from("email_outbox")
    .update({
      status: "sent",
      provider_message_id: providerMessageId || null,
      sent_at: new Date().toISOString(),
      last_error: null,
      last_error_category: null,
      fallback_used: fallbackUsed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function markOutboxFailure(
  id: string,
  attempt: number,
  classified: { category: EmailErrorCategory; retryable: boolean; message: string }
): Promise<EmailDeliveryStatus> {
  if (!isSupabaseLive() || !id) return classified.retryable ? "retrying" : "failed";
  const retry = classified.retryable && !isExhausted(attempt);
  const status: EmailDeliveryStatus = retry
    ? "retrying"
    : classified.retryable
      ? "dead_letter"
      : "failed";
  await supabaseAdmin
    .from("email_outbox")
    .update({
      status,
      attempt_count: attempt,
      last_error: classified.message.slice(0, 400),
      last_error_category: classified.category,
      next_attempt_at: retry ? nextAttemptAt(attempt).toISOString() : null,
      failed_at: retry ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  return status;
}

export async function recordAttempt(params: {
  outboxId?: string;
  attempt: number;
  status: string;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<void> {
  if (!isSupabaseLive() || !params.outboxId) return;
  try {
    await supabaseAdmin.from("email_attempts").insert({
      email_event_id: params.outboxId,
      attempt_number: params.attempt,
      provider: "zoho-smtp",
      status: params.status,
      provider_message_id: params.providerMessageId || null,
      error_code: params.errorCode || null,
      error_message: params.errorMessage ? params.errorMessage.slice(0, 400) : null,
    });
  } catch {
    /* non-fatal */
  }
}

export async function loadDueOutbox(limit = 10): Promise<OutboxRow[]> {
  if (!isSupabaseLive()) return [];
  const { data, error } = await supabaseAdmin
    .from("email_outbox")
    .select(
      "id, status, attempt_count, idempotency_key, recipient, sender, reply_to, subject, html, text, category, event_type, provider_message_id"
    )
    .in("status", ["pending", "retrying"])
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return data as OutboxRow[];
}

export async function claimDueRow(id: string, expectedStatus: string): Promise<boolean> {
  if (!isSupabaseLive()) return false;
  const { data, error } = await supabaseAdmin
    .from("email_outbox")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", expectedStatus)
    .select("id")
    .maybeSingle();
  return !error && Boolean(data);
}

export { EMAIL_MAX_ATTEMPTS };
