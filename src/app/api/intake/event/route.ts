import { NextRequest, NextResponse } from "next/server";
import * as React from "react";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send-email";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { sanitizePersonName, sanitizeMultilineText } from "@/lib/email/validation";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const intakeEventSchema = z.object({
  schema_version: z.number().default(1),
  event_id: z.string().uuid().optional(),
  correlation_id: z.string().optional(),
  idempotency_key: z.string().min(4).max(255),
  entity: z.enum(["corporate", "healthcare", "logicvoice", "voiceshield"]),
  environment: z.string().default("production"),
  source_site: z.string().max(255),
  form_id: z.string().max(100),
  form_version: z.string().default("v1"),
  source_record_id: z.string().max(255),
  record_type: z.enum(["booking", "contact", "demo", "support", "chat_lead", "commercial_inquiry"]),
  submitted_at: z.string().optional(),
  customer_name: z.string().max(255).optional(),
  customer_email: z.string().email().max(254),
  customer_phone: z.string().max(100).optional(),
  company_name: z.string().max(255).optional(),
  safe_fields: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize cross-site request via Bearer token or internal signature
    const authHeader = req.headers.get("authorization") || "";
    const internalSecret = process.env.LIT_INTERNAL_API_KEY || process.env.CRON_SECRET || "";
    
    // In production, require authorization header if internalSecret is set
    if (internalSecret && authHeader !== `Bearer ${internalSecret}`) {
      // Also allow if x-lit-internal header matches
      const customHeader = req.headers.get("x-lit-internal-token") || "";
      if (customHeader !== internalSecret) {
        return NextResponse.json(
          { success: false, message: "Unauthorized intake event dispatch" },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const parsed = intakeEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid intake schema", errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const eventId = data.event_id || crypto.randomUUID();
    const customerName = data.customer_name ? sanitizePersonName(data.customer_name) : "Valued Customer";
    const customerEmail = data.customer_email.trim().toLowerCase();
    const customerPhone = data.customer_phone ? sanitizePersonName(data.customer_phone, 40) : "";
    const companyName = data.company_name ? sanitizePersonName(data.company_name, 160) : "";

    // 2. Persist to intake_events if Supabase is live
    let storedId = eventId;
    let notificationState = "pending";

    if (isSupabaseLive()) {
      try {
        const { data: inserted, error } = await supabaseAdmin
          .from("intake_events")
          .upsert(
            [
              {
                event_id: eventId,
                correlation_id: data.correlation_id || null,
                idempotency_key: data.idempotency_key,
                entity: data.entity,
                environment: data.environment,
                source_site: data.source_site,
                form_id: data.form_id,
                form_version: data.form_version,
                source_record_id: data.source_record_id,
                record_type: data.record_type,
                submitted_at: data.submitted_at || new Date().toISOString(),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone || null,
                company_name: companyName || null,
                safe_fields: data.safe_fields,
                notification_state: "queued",
                sync_state: "synced",
              },
            ],
            { onConflict: "idempotency_key" }
          )
          .select("id")
          .maybeSingle();

        if (!error && inserted?.id) {
          storedId = String(inserted.id);
          notificationState = "queued";
        }
      } catch (dbErr) {
        console.error("[Central Intake] DB persistence error:", dbErr);
      }
    }

    // 3. Dispatch internal admin notification to admin@logicintelligencetechnologies.in
    const requirementsSummary = Object.entries(data.safe_fields)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join("\n");

    try {
      const emailRes = await sendEmail({
        to: getLeadNotificationRecipients(),
        from: "noReply",
        replyTo: customerEmail,
        subject: `[LIT · ${data.entity.toUpperCase()}] New ${data.record_type} · ${data.source_record_id}`,
        category: "transactional",
        eventType: "cross-site-intake-internal",
        templateKey: "new-lead-notification-email",
        idempotencyKey: `intake:${data.idempotency_key}:admin`,
        react: React.createElement(NewLeadNotificationEmail, {
          fullName: customerName,
          companyName: companyName || "—",
          email: customerEmail,
          phone: customerPhone || "—",
          service: `${data.entity.toUpperCase()} — ${data.record_type}`,
          requirements: `Entity: ${data.entity}\nSource Site: ${data.source_site}\nReference: ${data.source_record_id}\n${requirementsSummary}`,
          submissionDate: data.submitted_at || new Date().toISOString(),
        }),
      });

      if (emailRes.success) {
        notificationState = "sent";
      }
    } catch (emailErr) {
      console.error("[Central Intake] Email notification error:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        eventId,
        intakeId: storedId,
        status: "received",
        notificationState,
        message: "Intake event recorded and administrative notification dispatched.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Central Intake Fatal Error]", err);
    return NextResponse.json(
      { success: false, message: "Internal error processing intake event" },
      { status: 500 }
    );
  }
}
