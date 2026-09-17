import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as React from "react";
import { insertLead } from "@/lib/forms/persist";
import { sendEmail } from "@/lib/email/send-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import LeadConfirmationEmail from "@/emails/lead-confirmation-email";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { sanitizeMultilineText, sanitizePersonName } from "@/lib/email/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ticketSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  pageUrl: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`support:${clientIp(req)}`, 8, 15 * 60_000)) {
      return NextResponse.json(
        { success: false, code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = ticketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const name = sanitizePersonName(parsed.data.name);
    const email = parsed.data.email.trim().toLowerCase();
    const subject = sanitizePersonName(parsed.data.subject, 200);
    const message = sanitizeMultilineText(parsed.data.message, 5000);
    const priority = parsed.data.priority;

    // user_id intentionally omitted for public web submissions (nullable after migration)
    const stored = await insertLead("support_tickets", {
      subject: `[${priority}] ${subject}`,
      message: `From: ${name} (${email})\n\n${message}`,
      status: "Open",
      requester_name: name,
      requester_email: email,
      priority,
      source: "web-form",
      page_url: parsed.data.pageUrl || "/support/new",
    });

    if (!stored.ok) {
      return NextResponse.json(
        { success: false, code: "SUBMISSION_FAILED", message: stored.message },
        { status: 503 }
      );
    }

    try {
      await sendEmail({
        to: getLeadNotificationRecipients(),
        from: "support",
        replyTo: email,
        subject: `Support ticket: ${subject}`,
        category: "transactional",
        eventType: "support-internal",
        templateKey: "new-lead-notification-email",
        idempotencyKey: `support:${stored.id}:internal`,
        react: React.createElement(NewLeadNotificationEmail, {
          fullName: name,
          companyName: "—",
          email,
          phone: "—",
          service: `Support — ${priority}`,
          requirements: message,
          submissionDate: new Date().toISOString(),
        }),
      });
      await sendEmail({
        to: email,
        from: "support",
        subject: "We received your support request — Logic Intelligence Technologies",
        category: "transactional",
        eventType: "support-confirmation",
        templateKey: "lead-confirmation-email",
        idempotencyKey: `support:${stored.id}:customer`,
        react: React.createElement(LeadConfirmationEmail, {
          fullName: name,
          service: "Support",
        }),
      });
    } catch (emailErr) {
      console.error("[Support Email]", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Support request received",
        ticketId: stored.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Support API Error]", err);
    return NextResponse.json(
      {
        success: false,
        code: "SUBMISSION_FAILED",
        message: "Could not create the ticket. Please try again.",
      },
      { status: 500 }
    );
  }
}
