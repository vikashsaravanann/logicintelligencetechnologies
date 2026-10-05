import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/send-email";
import * as React from "react";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { COMPANY } from "@/config/company";
import {
  isValidEmail,
  normalizeEmail,
  sanitizePersonName,
  isSafeHttpUrl,
} from "@/lib/email/validation";
import { writeAdminAudit } from "@/lib/email/audit";

import InvoiceEmail from "@/emails/invoice-email";
import PaymentReceivedEmail from "@/emails/payment-received-email";
import ProjectKickoffEmail from "@/emails/project-kickoff-email";
import ProjectDeliveredEmail from "@/emails/project-delivered-email";
import ProposalSentEmail from "@/emails/proposal-sent-email";
import DemoReadyEmail from "@/emails/demo-ready-email";
import TestimonialRequestEmail from "@/emails/testimonial-request-email";
import MaintenanceRenewalEmail from "@/emails/maintenance-renewal-email";
import WelcomeEmail from "@/emails/welcome-email";
import BroadcastEmail from "@/emails/broadcast-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !isSafeHttpUrl(value)) return fallback;
  return value;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const xCronHeader = req.headers.get("x-cron-secret") ?? "";
  const isMachineCall =
    Boolean(process.env.CRON_SECRET) &&
    (authHeader.startsWith("Bearer ") || Boolean(xCronHeader));
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let authOk = false;
  if (isMachineCall) {
    const cron = process.env.CRON_SECRET || "";
    const auth = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : xCronHeader;
    if (cron && auth) {
      const a = Buffer.from(auth);
      const b = Buffer.from(cron);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        authOk = true;
      }
    }
  }

  try {
    let triggeredBy = "cron";
    if (!authOk) {
      const auth = await requireAdminApi(req);
      if (!auth.ok) {
        return NextResponse.json(
          { error: auth.message },
          { status: auth.status }
        );
      }
      triggeredBy = auth.email
        ? `session:${auth.email}`
        : `session:${auth.userId}`;
    }

    const body = await req.json();
    const type = String(body.type || "");
    const email = normalizeEmail(String(body.email || ""));
    const fullName = sanitizePersonName(String(body.fullName || ""), 120);
    const data = body.data && typeof body.data === "object" ? body.data : {};

    if (!isValidEmail(email) || !type) {
      return NextResponse.json(
        { error: "Missing email or type" },
        { status: 400 }
      );
    }

    let reactComponent: React.ReactElement;
    let subject = "";
    let fromAddress: "noReply" | "hello" | "admin" | "vikash" | "support" =
      "hello";
    let replyToAddress: string | undefined = undefined;
    const eventType = type;
    const site = COMPANY.websiteUrl;

    switch (type) {
      case "welcome":
        fromAddress = "noReply";
        subject = "Welcome to Logic Intelligence Technologies";
        reactComponent = React.createElement(WelcomeEmail, {
          fullName: fullName || email,
        });
        break;
      case "invoice":
        fromAddress = "admin";
        subject = `Invoice: ${sanitizePersonName(String(data.invoiceNumber || "INV-000"), 40)}`;
        reactComponent = React.createElement(InvoiceEmail, {
          fullName: fullName || "Client",
          amount: sanitizePersonName(String(data.amount || "0"), 40),
          dueDate: sanitizePersonName(String(data.dueDate || "Upon Receipt"), 40),
          invoiceNumber: sanitizePersonName(
            String(data.invoiceNumber || "INV-000"),
            40
          ),
          paymentLink: safeUrl(
            data.invoiceUrl || data.paymentLink,
            `${site}/dashboard`
          ),
        });
        break;
      case "payment":
        fromAddress = "admin";
        subject = "Payment received — thank you";
        reactComponent = React.createElement(PaymentReceivedEmail, {
          fullName: fullName || "Client",
          amount: sanitizePersonName(String(data.amount || "0"), 40),
          invoiceNumber: sanitizePersonName(
            String(data.invoiceNumber || "INV-000"),
            40
          ),
        });
        break;
      case "kickoff":
        fromAddress = "vikash";
        subject = `Project kickoff: ${sanitizePersonName(String(data.projectName || "Your Project"), 80)}`;
        reactComponent = React.createElement(ProjectKickoffEmail, {
          fullName: fullName || "Client",
          projectName: sanitizePersonName(
            String(data.projectName || "Your Project"),
            80
          ),
        });
        break;
      case "delivered":
        fromAddress = "support";
        subject = `Project delivered: ${sanitizePersonName(String(data.projectName || "Your Project"), 80)}`;
        reactComponent = React.createElement(ProjectDeliveredEmail, {
          fullName: fullName || "Client",
          projectName: sanitizePersonName(
            String(data.projectName || "Your Project"),
            80
          ),
          liveUrl: safeUrl(data.liveUrl, site),
        });
        break;
      case "proposal":
        fromAddress = "vikash";
        subject = "Project proposal from Logic Intelligence Technologies";
        reactComponent = React.createElement(ProposalSentEmail, {
          fullName: fullName || "Client",
          proposalUrl: safeUrl(data.proposalUrl, site),
        });
        break;
      case "demo-ready":
        fromAddress = "vikash";
        subject = "Your custom demo is ready";
        reactComponent = React.createElement(DemoReadyEmail, {
          fullName: fullName || "Client",
          demoUrl: safeUrl(data.demoUrl, site),
        });
        break;
      case "testimonial-request":
        fromAddress = "hello";
        subject = "How did we do? We would value your feedback";
        reactComponent = React.createElement(TestimonialRequestEmail, {
          fullName: fullName || "Client",
          reviewLink: safeUrl(data.reviewUrl, site),
        });
        break;
      case "maintenance-renewal":
        fromAddress = "admin";
        replyToAddress = COMPANY.emails.support;
        subject = "Maintenance and support plan renewal";
        reactComponent = React.createElement(MaintenanceRenewalEmail, {
          fullName: fullName || "Client",
          expiryDate: sanitizePersonName(String(data.renewalDate || ""), 40),
          renewLink: safeUrl(data.renewalUrl, `${site}/dashboard`),
        });
        break;
      case "broadcast":
        fromAddress = "hello";
        subject =
          sanitizePersonName(String(data.subject || "Message from LIT"), 200) ||
          "Message from LIT";
        reactComponent = React.createElement(BroadcastEmail, {
          fullName: fullName || undefined,
          subjectLine: subject,
          messageBody: String(data.message || "").slice(0, 8000),
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    const emailResult = await sendEmail({
      to: email,
      from: fromAddress,
      subject,
      react: reactComponent,
      replyTo: replyToAddress,
      category: type === "testimonial-request" ? "marketing" : "transactional",
      eventType,
      templateKey: type,
      idempotencyKey: `admin-trigger:${type}:${email}:${new Date().toISOString().slice(0, 13)}`,
    });

    if (!emailResult.success) {
      console.error(
        "[Email Error] Admin Trigger Failed:",
        emailResult.message,
        emailResult.errorCode
      );
      await writeAdminAudit({
        triggeredBy,
        emailType: type,
        recipient: email,
        outboxId: emailResult.outboxId,
        status: "failed",
        errorMessage: emailResult.message,
        ipAddress,
      });
      return NextResponse.json(
        {
          error: emailResult.message || "Failed to send email",
          status: emailResult.status,
          errorCategory: emailResult.errorCategory ?? null,
          errorCode: emailResult.errorCode ?? null,
          outboxId: emailResult.outboxId ?? null,
        },
        { status: 500 }
      );
    }

    await writeAdminAudit({
      triggeredBy,
      emailType: type,
      recipient: email,
      outboxId: emailResult.outboxId,
      status: emailResult.skipped ? "dry_run" : "sent",
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: emailResult.skipped
        ? `Email ${emailResult.status} (not delivered to provider)`
        : `Email ${emailResult.status}`,
      status: emailResult.status,
      skipped: Boolean(emailResult.skipped),
      outboxId: emailResult.outboxId ?? null,
      messageId: emailResult.messageId ?? null,
    });
  } catch (error) {
    console.error("Admin Email Trigger Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
