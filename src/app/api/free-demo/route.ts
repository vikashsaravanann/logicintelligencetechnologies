import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import LeadConfirmationEmail from "@/emails/lead-confirmation-email";
import * as React from "react";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { sanitizePersonName, sanitizeMultilineText } from "@/lib/email/validation";
import { insertLead } from "@/lib/forms/persist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  fullName: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Valid email required").max(254),
  phone: z.string().max(40).optional(),
  companyName: z.string().max(160).optional(),
  projectType: z.string().max(80).optional().default("Free Demo"),
  budgetRange: z.string().max(80).optional(),
  timeline: z.string().max(80).optional(),
  description: z.string().max(5000).optional().default(""),
  pageUrl: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`free-demo:${clientIp(req)}`, 8, 15 * 60_000))) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const fullName = sanitizePersonName(parsed.data.fullName);
    const email = parsed.data.email.trim().toLowerCase();
    const phone = parsed.data.phone ? sanitizePersonName(parsed.data.phone, 40) : "";
    const companyName = parsed.data.companyName
      ? sanitizePersonName(parsed.data.companyName, 160)
      : "";
    const projectType = sanitizePersonName(parsed.data.projectType || "Free Demo", 80);
    const budgetRange = parsed.data.budgetRange
      ? sanitizePersonName(parsed.data.budgetRange, 80)
      : "";
    const timeline = parsed.data.timeline
      ? sanitizePersonName(parsed.data.timeline, 80)
      : "";
    const description = sanitizeMultilineText(parsed.data.description || "", 5000);

    const stored = await insertLead("contact_leads", {
      name: fullName,
      email,
      company: companyName || null,
      phone: phone || null,
      project_type: projectType,
      budget: budgetRange || null,
      timeline: timeline || null,
      source: "free-demo-form",
      page_url: parsed.data.pageUrl || "/free-demo",
      message: [
        description || "",
        phone ? `Phone: ${phone}` : "",
        budgetRange ? `Budget: ${budgetRange}` : "",
        timeline ? `Timeline: ${timeline}` : "",
        projectType ? `Type: ${projectType}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (!stored.ok) {
      return NextResponse.json({ success: false, message: stored.message }, { status: 503 });
    }

    const idemBase = stored.id;

    try {
      const emailResult = await sendEmail({
        to: getLeadNotificationRecipients(),
        from: "noReply",
        replyTo: email,
        subject: `New Free Demo Request: ${projectType} from ${fullName}`,
        category: "transactional",
        eventType: "demo-internal",
        templateKey: "new-lead-notification-email",
        idempotencyKey: `demo:${idemBase}:internal`,
        react: React.createElement(NewLeadNotificationEmail, {
          fullName,
          email,
          phone: phone || "N/A",
          companyName: companyName || "N/A",
          service: projectType,
          requirements: `Budget: ${budgetRange || "n/a"} | Timeline: ${timeline || "n/a"}\n\n${description || ""}`,
          submissionDate: new Date().toISOString(),
        }),
      });
      if (!emailResult.success) {
        console.error("[Email Error] Internal notification failed:", emailResult.message);
      }
    } catch (emailErr) {
      console.error("[Email Error] Internal notification exception:", emailErr);
    }

    try {
      const emailResult = await sendEmail({
        to: email,
        from: "hello",
        subject: "We received your demo request — Logic Intelligence Technologies",
        category: "transactional",
        eventType: "demo-confirmation",
        templateKey: "lead-confirmation-email",
        idempotencyKey: `demo:${idemBase}:customer`,
        react: React.createElement(LeadConfirmationEmail, {
          fullName,
          service: projectType,
        }),
      });
      if (!emailResult.success) {
        console.error("[Email Error] User confirmation failed:", emailResult.message);
      }
    } catch (emailErr) {
      console.error("[Email Error] User confirmation exception:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Request received",
      leadId: stored.id,
    });
  } catch (error) {
    console.error("Free Demo API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

