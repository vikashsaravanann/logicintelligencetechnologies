import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
import { isSupabaseLive } from "@/lib/email/config";
import { sanitizeMultilineText, sanitizePersonName } from "@/lib/email/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email("Invalid email address").max(254).optional(),
  answers: z.array(z.string().max(2000)).max(40).optional(),
  type: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`checklist:${clientIp(req)}`, 10, 15 * 60_000)) {
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

    let leadId: string | null = null;
    if (isSupabaseLive()) {
      try {
        const { data, error: dbError } = await supabaseAdmin
          .from("checklist_leads")
          .insert([
            {
              name: "Anonymous",
              email: email || "unknown@example.com",
              company: isLeadMagnet ? "Lead Magnet" : answers[1] || "",
              role: isLeadMagnet ? "Downloaded Checklist" : answers[2] || "",
            },
          ])
          .select("id")
          .maybeSingle();

        if (dbError) {
          console.error("[DB Error] Failed to insert checklist submission:", dbError);
        }
        leadId = data?.id || null;
      } catch (dbErr) {
        console.error("[DB Error] Checklist insert exception:", dbErr);
      }
    }

    const idemBase = leadId || `${email || "anon"}:${isLeadMagnet ? "magnet" : "discovery"}:${new Date().toISOString().slice(0, 13)}`;

    if (email) {
      try {
        const attachments: Array<{ filename: string; path: string }> = [];
        if (isLeadMagnet) {
          const pdfPath = path.join(process.cwd(), "public", "checklist.pdf");
          if (fs.existsSync(pdfPath)) {
            attachments.push({
              filename: "Website-Launch-Checklist.pdf",
              path: pdfPath,
            });
          }
        }

        const emailResult = await sendEmail({
          to: email,
          from: "noReply",
          subject: isLeadMagnet
            ? "Your Website Launch Checklist"
            : "We received your discovery responses",
          category: "transactional",
          eventType: isLeadMagnet ? "resource-delivery" : "discovery-confirmation",
          templateKey: isLeadMagnet ? "checklist-download-email" : "lead-confirmation-email",
          idempotencyKey: `${isLeadMagnet ? "resource" : "discovery"}-confirmation:${idemBase}`,
          react: isLeadMagnet
            ? React.createElement(ChecklistDownloadEmail, { fullName: displayName })
            : React.createElement(LeadConfirmationEmail, {
                fullName: displayName,
                service: "Project Discovery Questionnaire",
              }),
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        if (!emailResult.success) {
          console.error("[Email Error] Failed to send email:", emailResult.message);
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
          ? `New checklist download: ${email}`
          : `New discovery questionnaire: ${email || "Anonymous"}`,
        category: "transactional",
        eventType: isLeadMagnet ? "resource-internal" : "discovery-internal",
        templateKey: isLeadMagnet ? "new-lead-notification-email" : "checklist-submission-email",
        idempotencyKey: `${isLeadMagnet ? "resource" : "discovery"}-internal:${idemBase}`,
        react: isLeadMagnet
          ? React.createElement(NewLeadNotificationEmail, {
              fullName: displayName,
              companyName: "—",
              email: email || "Not provided",
              phone: "—",
              service: "Free Checklist Download",
              requirements:
                "The visitor requested the Website Launch Checklist PDF from the /checklist page.",
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

    return NextResponse.json({ success: true, message: "Request received" });
  } catch (error) {
    console.error("Checklist API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
