import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive, isEmailDryRun } from "@/lib/email/config";
import { isSmtpConfigured } from "@/lib/email/smtp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // 1. Enforce authorization
  const authHeader = req.headers.get("authorization") || "";
  const internalSecret = process.env.LIT_INTERNAL_API_KEY || process.env.CRON_SECRET || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  const isInternalAuthorized = internalSecret && token === internalSecret;

  // Check admin session cookie if not authorized via header
  if (!isInternalAuthorized) {
    const sessionCookie = req.cookies.get("lit_admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin or service credentials required." },
        { status: 401 }
      );
    }
  }

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    overall_status: "healthy",
  };

  // 2. Database Reachability Diagnostic
  const dbStatus = {
    configured: isSupabaseLive(),
    reachable: false,
    bookings_table: "unknown",
    intake_events_table: "unknown",
    email_outbox_table: "unknown",
    error: null as string | null,
  };

  if (dbStatus.configured) {
    try {
      const { count: bCount, error: bErr } = await supabaseAdmin
        .from("bookings")
        .select("id", { count: "exact", head: true });
      dbStatus.bookings_table = bErr ? `error: ${bErr.code || bErr.message}` : "available";

      const { count: iCount, error: iErr } = await supabaseAdmin
        .from("intake_events")
        .select("id", { count: "exact", head: true });
      dbStatus.intake_events_table = iErr ? `error: ${iErr.code || iErr.message}` : "available";

      const { count: oCount, error: oErr } = await supabaseAdmin
        .from("email_outbox")
        .select("id", { count: "exact", head: true });
      dbStatus.email_outbox_table = oErr ? `error: ${oErr.code || oErr.message}` : "available";

      dbStatus.reachable = !bErr && !iErr && !oErr;
    } catch (err) {
      dbStatus.reachable = false;
      dbStatus.error = err instanceof Error ? err.message : String(err);
    }
  } else {
    results.overall_status = "degraded";
  }
  results.database = dbStatus;

  // 3. Email & Outbox Queue Diagnostic
  const emailStatus = {
    dry_run: isEmailDryRun(),
    smtp_hello_configured: isSmtpConfigured("hello"),
    smtp_noreply_configured: isSmtpConfigured("noReply"),
    admin_recipient: "admin@logicintelligencetechnologies.in",
  };
  results.email = emailStatus;

  // 4. n8n Central Webhook Reachability
  const n8nStatus = {
    configured: true,
    webhook_url: "https://automation.logicintelligencetechnologies.in/webhook/internal/email-events/v1",
    reachable: false,
  };

  try {
    const res = await fetch("https://automation.logicintelligencetechnologies.in/healthz", {
      method: "GET",
      headers: { "User-Agent": "LIT-HealthCheck/1.0" },
      signal: AbortSignal.timeout(3000),
    });
    n8nStatus.reachable = res.status < 500;
  } catch {
    // Non-fatal if health check endpoint doesn't respond to plain GET
    n8nStatus.reachable = false;
  }
  results.n8n = n8nStatus;

  if (!dbStatus.reachable || (!emailStatus.smtp_hello_configured && !emailStatus.dry_run)) {
    results.overall_status = "degraded";
  }

  return NextResponse.json(results, { status: 200 });
}
