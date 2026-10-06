import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dispatchAutomationEvent } from "@/lib/automation/dispatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function timingEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  try {
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

/**
 * Dispatch pending automation events to n8n. Runs every 15 minutes. A pending
 * event becomes `dispatched` on a 2xx; it stays `pending` when the channel is
 * not configured or n8n is briefly unreachable (so it retries later); it is
 * marked `failed` only when no workflow handles its type. Completion is
 * recorded separately by the signed callback.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  if (!secret || !authHeader.startsWith("Bearer ") || !timingEqual(authHeader.slice(7), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: events } = await supabaseAdmin
    .from("automation_events")
    .select("id, event_type, payload")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(10);

  let dispatched = 0;
  let failed = 0;
  let notConfigured = false;

  for (const ev of events ?? []) {
    const r = await dispatchAutomationEvent(ev.id, ev.event_type, (ev.payload ?? {}) as Record<string, unknown>);
    if (r.state === "dispatched") {
      await supabaseAdmin.from("automation_events").update({ status: "dispatched" }).eq("id", ev.id);
      dispatched++;
    } else if (r.state === "no_workflow") {
      await supabaseAdmin.from("automation_events").update({ status: "failed" }).eq("id", ev.id);
      failed++;
    } else if (r.state === "not_configured") {
      notConfigured = true;
      // leave pending
    }
    // 'error' leaves the event pending for the next run.
  }

  return NextResponse.json({ ok: true, dispatched, failed, notConfigured, considered: events?.length ?? 0 });
}
