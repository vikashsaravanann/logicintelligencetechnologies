/**
 * Email webhook event deduplication.
 *
 * Before processing any inbound provider webhook, call recordWebhookEvent().
 * The UNIQUE constraint on (provider, provider_event_id) ensures that a
 * replayed or duplicated webhook cannot trigger processing twice.
 */
import "server-only";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "./config";

export type WebhookProvider = "stripe" | "zoho" | "other";

export type WebhookRecordResult =
  | { ok: true; id: string; duplicate: false }
  | { ok: true; id: string; duplicate: true }
  | { ok: false; error: string };

/**
 * Idempotently record an inbound webhook event.
 *
 * Returns `duplicate: true` when the event was already stored — callers
 * should return HTTP 200 (acknowledge) without re-processing.
 *
 * Returns `ok: false` when Supabase is unavailable — callers should still
 * process the event but log the storage failure.
 */
export async function recordWebhookEvent(
  provider: WebhookProvider,
  providerEventId: string,
  eventType: string,
  rawBody: string
): Promise<WebhookRecordResult> {
  if (!isSupabaseLive()) {
    return { ok: false, error: "Database not configured" };
  }

  const payloadHash = crypto
    .createHash("sha256")
    .update(rawBody)
    .digest("hex");

  const { data, error } = await supabaseAdmin
    .from("email_webhook_events")
    .insert({
      provider,
      provider_event_id: providerEventId,
      event_type: eventType,
      payload_hash: payloadHash,
      status: "received",
    })
    .select("id")
    .single();

  // Duplicate key → already processed
  if (error) {
    if (error.code === "23505" || /duplicate/i.test(error.message ?? "")) {
      const existing = await supabaseAdmin
        .from("email_webhook_events")
        .select("id")
        .eq("provider", provider)
        .eq("provider_event_id", providerEventId)
        .maybeSingle();
      return {
        ok: true,
        id: (existing.data?.id as string) ?? "",
        duplicate: true,
      };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data.id as string, duplicate: false };
}

/** Mark a previously recorded webhook event as processed (or failed). */
export async function markWebhookProcessed(
  id: string,
  status: "processed" | "failed" | "ignored",
  error?: string
): Promise<void> {
  if (!isSupabaseLive() || !id) return;
  await supabaseAdmin
    .from("email_webhook_events")
    .update({
      status,
      processed_at: new Date().toISOString(),
      error: error ? error.slice(0, 400) : null,
    })
    .eq("id", id);
}
