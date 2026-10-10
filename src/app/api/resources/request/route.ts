import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/ai/rate-limit";
import { insertLead } from "@/lib/forms/persist";
import { redis } from "@/lib/ai/redis";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import * as React from "react";
import { PDF_RESOURCES } from "@/config/pdfs";
import { sendEmail } from "@/lib/email/send-email";
import ResourceDeliveryEmail from "@/emails/resource-delivery-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`resource_req:${clientIp(req)}`, 10, 15 * 60_000))) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { fullName, email, companyName, resourceId } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid corporate email is required." },
        { status: 400 }
      );
    }

    const resource = PDF_RESOURCES.find((r) => r.id === resourceId);
    if (!resource) {
      return NextResponse.json(
        { success: false, message: "Resource not found." },
        { status: 404 }
      );
    }

    // 1. Lead Persistence
    if (resource.accessType === "gated") {
      const persisted = await insertLead("checklist_leads", {
        full_name: fullName || "Unknown",
        email: email,
        company_name: companyName || "",
        project_type: `Resource Download: ${resource.title}`,
        status: "new",
      });

      if (!persisted.ok) {
        return NextResponse.json(
          { success: false, message: "Failed to verify request. Please try again." },
          { status: 500 }
        );
      }
    }

    // 2. Generate secure short-lived token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token in Redis (or in-memory map if Redis is not configured, but Redis is standard now)
    if (redis) {
      await redis.setex(`res_token:${token}`, 600, resource.id); // 10 minutes
    } else {
      // Fallback if Redis fails (though we should require Redis in production per P1)
      // For now, we will fail safely if no Redis is configured.
      return NextResponse.json(
        { success: false, message: "Secure storage is not configured." },
        { status: 500 }
      );
    }

    // Best-effort: deliver the requested PDF by email. The lead is already
    // captured and the secure download token is returned regardless, so email
    // failures never block the response.
    try {
      const filePath = path.join(process.cwd(), "private", "resources", resource.filename);
      const attachments = fs.existsSync(filePath)
        ? [{ filename: resource.filename, path: filePath }]
        : undefined;

      await sendEmail({
        to: email,
        from: "noReply",
        subject: `Your requested document: ${resource.title}`,
        category: "transactional",
        eventType: "resource-delivery",
        templateKey: "resource-delivery-email",
        idempotencyKey: `resource:${token}:customer`,
        react: React.createElement(ResourceDeliveryEmail, {
          fullName: fullName || "there",
          resourceTitle: resource.title,
        }),
        attachments,
      });
    } catch (emailErr) {
      console.error("[Resource Request] email delivery failed:", emailErr);
    }

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("[Resource Request]", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
