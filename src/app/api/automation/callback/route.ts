import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyV1 } from "@/lib/automation/webhook-signing";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY = 64 * 1024;

const callbackSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(["processed", "failed"]),
  detail: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Signed completion callback from n8n. Order matters: bound the body, rate
 * limit, VERIFY THE SIGNATURE BEFORE PARSING, then dedup + apply. Auth is the
 * HMAC (the route is public under /api). Fails closed without the shared secret.
 */
export async function POST(req: Request) {
  // Bound the body before reading it fully.
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY) {
    return NextResponse.json({ error: "Body too large" }, { status: 413 });
  }
  if (!(await rateLimit(`automation-callback:${clientIp(req)}`, 60, 60_000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY) {
    return NextResponse.json({ error: "Body too large" }, { status: 413 });
  }

  const verify = verifyV1(
    process.env.N8N_WEBHOOK_SECRET,
    req.headers.get("x-lit-signature"),
    req.headers.get("x-lit-timestamp"),
    req.headers.get("x-lit-event-id"),
    rawBody,
  );
  if (!verify.ok) {
    // Generic 401; do not leak which part failed.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof callbackSchema>;
  try {
    body = callbackSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // The signed header event id must match the body (bound the signature to it).
  if (req.headers.get("x-lit-event-id") !== body.eventId) {
    return NextResponse.json({ error: "Event id mismatch" }, { status: 400 });
  }

  const { data: event } = await supabaseAdmin
    .from("automation_events")
    .select("id, status")
    .eq("id", body.eventId)
    .maybeSingle();
  if (!event) {
    return NextResponse.json({ error: "Unknown event" }, { status: 404 });
  }

  // Idempotent: a terminal event is not re-applied.
  if (event.status === "processed" || event.status === "failed") {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const { error } = await supabaseAdmin
    .from("automation_events")
    .update({ status: body.status })
    .eq("id", body.eventId)
    .in("status", ["pending", "dispatched"]);

  if (error) {
    return NextResponse.json({ error: "Could not record callback" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
