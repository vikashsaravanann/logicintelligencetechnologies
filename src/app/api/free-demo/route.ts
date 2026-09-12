import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import FreeDemoConfirmationEmail from "@/emails/free-demo-confirmation-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import { z } from "zod";
import * as React from "react";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { isSupabaseLive } from "@/lib/email/config";
import { COMPANY } from "@/config/company";
import { sanitizeMultilineText, sanitizePersonName } from "@/lib/email/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address").max(254),
  phone: z.string().max(40).optional(),
  business: z.string().max(160).optional(),
  service_type: z.string().max(80).optional().default("General Enquiry"),
  budget: z.string().max(80).optional(),
  requirements: z.string().max(5000).optional(),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`demo:${clientIp(req)}`, 8, 15 * 60_000)) {
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

    const name = sanitizePersonName(parsed.data.name);
    const email = parsed.data.email.trim().toLowerCase();
    const phone = parsed.data.phone ? sanitizePersonName(parsed.data.phone, 40) : "";
    const business = parsed.data.business ? sanitizePersonName(parsed.data.business, 160) : "";
    const service_type = sanitizePersonName(parsed.data.service_type || "General Enquiry", 80);
    const budget = parsed.data.budget ? sanitizePersonName(parsed.data.budget, 80) : "";
    const requirements = sanitizeMultilineText(parsed.data.requirements || "", 5000);

    let leadId: string | null = null;
    if (isSupabaseLive()) {
      try {
        const { data, error: dbError } = await supabaseAdmin
          .from("demo_leads")
          .insert([
            {
              first_name: name.split(" ")[0] || name,
              last_name: name.split(" ").slice(1).join(" ") || "",
              email,
              phone: phone || "",
              company_name: business || "",
              job_title: "",
              interests: [service_type],
              budget: budget || "",
            },
          ])
          .select("id")
          .maybeSingle();

        if (dbError) {
          console.error("[DB Error] Failed to insert lead:", dbError);
        }
        leadId = data?.id || null;
      } catch (dbErr) {
        console.error("[DB Error] Demo lead insert exception:", dbErr);
      }
    }

    const idemBase = leadId || `${email}:${new Date().toISOString().slice(0, 13)}`;

    try {
      const emailResult = await sendEmail({
        to: email,
        from: "hello",
        replyTo: COMPANY.emails.hello,
        subject: "We received your request — Logic Intelligence Technologies",
        category: "transactional",
        eventType: "demo-confirmation",
        templateKey: "free-demo-confirmation-email",
        idempotencyKey: `demo-confirmation:${idemBase}`,
        react: React.createElement(FreeDemoConfirmationEmail, { fullName: name }),
      });
      if (!emailResult.success) {
        console.error("[Email Error] Failed to send email:", emailResult.message);
      }
    } catch (emailErr) {
      console.error("[Email Error] User confirmation failed:", emailErr);
    }

    try {
      const emailResult = await sendEmail({
        to: getLeadNotificationRecipients(),
        from: "noReply",
        replyTo: email,
        subject: `New website enquiry: ${name} — ${service_type}`,
        category: "transactional",
        eventType: "demo-internal",
        templateKey: "new-lead-notification-email",
        idempotencyKey: `demo-internal:${idemBase}`,
        react: React.createElement(NewLeadNotificationEmail, {
          fullName: name,
          companyName: business || "",
          email,
          phone: phone || "",
          service: service_type,
          requirements: requirements || "",
          submissionDate: new Date().toISOString(),
        }),
      });
      if (!emailResult.success) {
        console.error("[Email Error] Failed to send email:", emailResult.message);
      }
    } catch (emailErr) {
      console.error("[Email Error] Internal notification failed:", emailErr);
    }

    return NextResponse.json({ success: true, message: "Request received" });
  } catch (error) {
    console.error("Free Demo API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
