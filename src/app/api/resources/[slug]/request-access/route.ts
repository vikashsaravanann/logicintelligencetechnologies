import { NextResponse } from "next/server";
import * as React from "react";
import { z } from "zod";
import { getPdfResourceBySlug } from "@/config/pdfs";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import {
  isValidEmail,
  normalizeEmail,
  sanitizePersonName,
  sanitizeHeaderValue,
} from "@/lib/email/validation";
import { insertLead } from "@/lib/forms/persist";
import { issueResourceAccessToken } from "@/lib/resources/access-token";
import { sendEmail } from "@/lib/email/send-email";
import { getLeadNotificationRecipients } from "@/lib/email/recipients";
import { EMAIL } from "@/emails/components/email-styles";
import ResourceAccessEmail from "@/emails/resource-access-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().min(3).max(254),
  company: z.string().max(200).optional(),
  marketingConsent: z.boolean().optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await ctx.params;
    const slug = String(rawSlug || "").trim().toLowerCase();

    if (!rateLimit(`resource-access:${clientIp(req)}`, 8, 15 * 60_000)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const resource = getPdfResourceBySlug(slug);
    if (!resource) {
      return NextResponse.json(
        { success: false, message: "Resource not found." },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid name and work email." },
        { status: 400 }
      );
    }

    const fullName = sanitizePersonName(parsed.data.fullName, 120);
    const email = normalizeEmail(parsed.data.email);
    const company = sanitizeHeaderValue(parsed.data.company || "", 200);

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please enter your full name." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid work email." },
        { status: 400 }
      );
    }

    const stored = await insertLead("contact_leads", {
      name: fullName,
      email,
      company: company || null,
      phone: null,
      project_type: "Resource Download",
      budget: null,
      timeline: null,
      source: "resource-center",
      page_url: `/resources/${resource.slug}`,
      message: `Resource access: ${resource.title} (${resource.slug})`,
    });

    if (!stored.ok) {
      return NextResponse.json(
        { success: false, message: stored.message },
        { status: 503 }
      );
    }

    const access = issueResourceAccessToken(resource.slug);
    const downloadUrl = `${EMAIL.siteUrl}/api/resources/${encodeURIComponent(resource.slug)}/download?token=${encodeURIComponent(access.token)}`;

    try {
      await sendEmail({
        to: email,
        from: "noReply",
        subject: `Your resource: ${resource.title}`,
        react: React.createElement(ResourceAccessEmail, {
          fullName,
          resourceTitle: resource.title,
          downloadUrl,
          expiresInMinutes: Math.floor(access.expiresInSec / 60),
        }),
        eventType: "resource-delivery",
        templateKey: "resource-access-email",
        idempotencyKey: `resource:${resource.slug}:${stored.id}:customer`,
      });
    } catch (err) {
      console.error("[resource-access] customer email failed", err);
    }

    try {
      const recipients = getLeadNotificationRecipients();
      if (recipients.length) {
        await sendEmail({
          to: recipients,
          from: "noReply",
          subject: `Resource request: ${resource.title} — ${fullName}`,
          react: React.createElement(NewLeadNotificationEmail, {
            fullName,
            email,
            companyName: company || undefined,
            service: `Resource: ${resource.title}`,
            requirements: `Requested gated PDF: ${resource.slug}`,
          }),
          eventType: "resource-internal",
          templateKey: "new-lead-notification-email",
          idempotencyKey: `resource:${resource.slug}:${stored.id}:internal`,
        });
      }
    } catch (err) {
      console.error("[resource-access] admin email failed", err);
    }

    return NextResponse.json({
      success: true,
      message: "Access granted. Your download is ready.",
      downloadUrl,
      expiresAt: access.expiresAt,
      resource: { slug: resource.slug, title: resource.title, filename: resource.filename },
      leadId: stored.id,
      emailQueued: true,
    });
  } catch (err) {
    console.error("[resource-access]", err);
    return NextResponse.json(
      { success: false, message: "Unable to process your request. Please try again." },
      { status: 500 }
    );
  }
}
