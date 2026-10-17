import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send-email";
import ChecklistSubmissionEmail from "@/emails/checklist-submission-email";
import LeadConfirmationEmail from "@/emails/lead-confirmation-email";
import ChecklistDownloadEmail from "@/emails/checklist-download-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import { z } from "zod";
import * as React from "react";
import path from "path";
import fs from "fs";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { sanitizeMultilineText, sanitizePersonName } from "@/lib/email/validation";
import { insertLead } from "@/lib/forms/persist";
import { getStaffSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email("Invalid email address").max(254).optional(),
  answers: z.array(z.string().max(2000)).max(40).optional(),
  type: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`checklist:${clientIp(req)}`, 10, 15 * 60_000))) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    const answers = (parsed.data.answers || []).map((item) => sanitizeMultilineText(item, 2000));
    const email = parsed.data.email?.trim().toLowerCase();
    const isLeadMagnet = parsed.data.type === "lead_magnet";
    const displayName = email ? sanitizePersonName(email.split("@")[0], 80) : "there";

    if (isLeadMagnet && !email) {
      return NextResponse.json(
        { success: false, message: "Email is required to receive the checklist." },
        { status: 400 }
      );
    }

    const stored = await insertLead("checklist_leads", {
      name: displayName === "there" ? "Anonymous" : displayName,
      email: email || "unknown@example.com",
      company: isLeadMagnet ? "Lead Magnet" : answers[1] || "",
      role: isLeadMagnet ? "Downloaded Checklist" : answers[2] || "",
      answers,
      metadata: {
        type: parsed.data.type || (isLeadMagnet ? "lead_magnet" : "checklist"),
        answer_count: answers.length,
        submitted_at: new Date().toISOString(),
      },
    });

    if (!stored.ok) {
      return NextResponse.json({ success: false, message: stored.message }, { status: 503 });
    }

    const idemBase = stored.id;

    let customerEmailSent = false;
    if (email) {
      try {
        const attachments: Array<{ filename: string; path: string }> = [];
        let downloadUrl = "https://www.logicintelligencetechnologies.in/checklist";

        if (isLeadMagnet) {
          const { resolveResourcePdfPath } = await import("@/lib/resources/pdf-resolver");
          const resolvedPath =
            resolveResourcePdfPath("website-development-checklist.pdf") ||
            path.join(process.cwd(), "private", "resources", "website-development-checklist.pdf");

          if (fs.existsSync(resolvedPath)) {
            attachments.push({
              filename: "LIT-50-Point-Enterprise-Deployment-Checklist.pdf",
              path: resolvedPath,
            });
          }

          try {
            const { issueResourceAccessToken } = await import("@/lib/resources/access-token");
            const tokenInfo = issueResourceAccessToken("website-development-checklist");
            const siteUrl = (
              process.env.NEXT_PUBLIC_SITE_URL || "https://www.logicintelligencetechnologies.in"
            ).replace(/\/$/, "");
            downloadUrl = `${siteUrl}/api/resources/website-development-checklist/download?token=${encodeURIComponent(
              tokenInfo.token
            )}`;
          } catch (tErr) {
            console.warn("[Checklist] Token issue failed, using default url:", tErr);
          }
        }

        const emailResult = await sendEmail({
          to: email,
          from: "noReply",
          subject: isLeadMagnet
            ? "Your 50-Point Enterprise Deployment Checklist"
            : "We received your discovery responses",
          category: "transactional",
          eventType: isLeadMagnet ? "resource-delivery" : "discovery-confirmation",
          templateKey: isLeadMagnet ? "checklist-download-email" : "lead-confirmation-email",
          idempotencyKey: `${isLeadMagnet ? "resource" : "discovery"}:${idemBase}:customer`,
          react: isLeadMagnet
            ? React.createElement(ChecklistDownloadEmail, {
                fullName: displayName,
                downloadUrl,
              })
            : React.createElement(LeadConfirmationEmail, {
                fullName: displayName,
                service: "Project Discovery Questionnaire",
              }),
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        if (!emailResult.success) {
          console.error("[Email Error] Failed to send email:", emailResult.message);
        } else {
          customerEmailSent = true;
        }
      } catch (emailErr) {
        console.error("[Email Error] Checklist user confirmation failed:", emailErr);
      }
    }

    try {
      const emailResult = await sendEmail({
        to: getLeadNotificationRecipients(),
        from: "noReply",
        replyTo: email || undefined,
        subject: isLeadMagnet
          ? `New 50-point checklist download: ${email}`
          : `New discovery questionnaire: ${email || "Anonymous"}`,
        category: "transactional",
        eventType: isLeadMagnet ? "resource-internal" : "discovery-internal",
        templateKey: isLeadMagnet ? "new-lead-notification-email" : "checklist-submission-email",
        idempotencyKey: `${isLeadMagnet ? "resource" : "discovery"}:${idemBase}:internal`,
        react: isLeadMagnet
          ? React.createElement(NewLeadNotificationEmail, {
              fullName: displayName,
              companyName: "—",
              email: email || "Not provided",
              phone: "—",
              service: "50-Point Enterprise Deployment Checklist",
              requirements:
                "The visitor requested the 50-Point Enterprise Deployment Checklist PDF from the /checklist page.",
              submissionDate: new Date().toISOString(),
            })
          : React.createElement(ChecklistSubmissionEmail, {
              email: email || "Not provided",
              answers,
              submissionDate: new Date().toISOString(),
            }),
      });
      if (!emailResult.success) {
        console.error("[Email Error] Failed to send email:", emailResult.message);
      }
    } catch (emailErr) {
      console.error("[Email Error] Checklist internal notification failed:", emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Request received", 
      leadId: stored.id,
      emailSent: customerEmailSent 
    });
  } catch (error) {
    console.error("Checklist API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Form-specific admin reader to inspect checklist leads and complete answers (FORMS04)
 */
export async function GET(req: Request) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Staff or administrator session required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

    if (id) {
      const { data: lead, error } = await supabaseAdmin
        .from("checklist_leads")
        .select("id, name, email, company, role, answers, metadata, created_at")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { success: false, message: `Database query failed: ${error.message}` },
          { status: 500 }
        );
      }

      if (!lead) {
        return NextResponse.json(
          { success: false, message: "Checklist lead not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, lead });
    }

    const { data: leads, error } = await supabaseAdmin
      .from("checklist_leads")
      .select("id, name, email, company, role, answers, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { success: false, message: `Database query failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, leads: leads || [] });
  } catch (error: any) {
    console.error("Checklist GET Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
