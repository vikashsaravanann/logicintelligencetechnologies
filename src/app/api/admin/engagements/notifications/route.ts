import "server-only";
import { NextRequest, NextResponse } from "next/server";
import * as React from "react";
import { createClientNotification } from "@/lib/client-portal/v4-actions";
import { sendEmail } from "@/lib/email/send-email";
import AdminGenericEmail from "@/emails/admin-generic-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      engagementRef,
      clientEmail,
      title,
      message,
      category = "message",
      actionUrl,
      actionLabel,
      sendEmailAlert = true,
    } = body;

    if (!clientEmail || !title || !message) {
      return NextResponse.json(
        { success: false, error: "clientEmail, title, and message are required." },
        { status: 400 }
      );
    }

    const validCategories = [
      "action_required",
      "milestone",
      "document",
      "payment",
      "system",
      "message",
    ];
    const safeCategory = validCategories.includes(category) ? category : "message";

    const defaultActionUrl = engagementRef
      ? `/client/notifications?ref=${encodeURIComponent(engagementRef)}`
      : `/client/notifications`;

    const defaultActionLabel = actionLabel || "View Notification";

    const created = await createClientNotification({
      clientEmail: clientEmail.trim().toLowerCase(),
      engagementRef: engagementRef ? engagementRef.trim() : null,
      title: title.trim(),
      message: message.trim(),
      category: safeCategory as any,
      actionUrl: actionUrl ? actionUrl.trim() : defaultActionUrl,
      actionLabel: defaultActionLabel,
      metadata: {
        dispatched_by: "Admin Control Center",
        dispatched_at: new Date().toISOString(),
      },
    });

    if (!created) {
      return NextResponse.json(
        { success: false, error: "Failed to persist notification in client portal database." },
        { status: 500 }
      );
    }

    // Optional email notification alert
    let emailSent = false;
    if (sendEmailAlert) {
      try {
        const portalUrl = actionUrl || (engagementRef
          ? `https://www.logicintelligencetechnologies.in/client/notifications?ref=${encodeURIComponent(engagementRef)}`
          : `https://www.logicintelligencetechnologies.in/client/notifications`);

        const emailBody = `${title}\n\n${message}\n\nYou can review this notification directly in your secure client workspace:\n${portalUrl}`;

        await sendEmail({
          to: clientEmail.trim().toLowerCase(),
          subject: `[Workspace Notification] ${title}`,
          from: "hello",
          category: "operational",
          react: React.createElement(AdminGenericEmail, { message: emailBody }),
        });
        emailSent = true;
      } catch (emailErr) {
        console.warn("[Admin Notification API] Email dispatch non-critical error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notification successfully sent to client workspace.",
      emailSent,
    });
  } catch (err: unknown) {
    console.error("[Admin Notification API] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
