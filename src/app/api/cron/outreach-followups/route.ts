import { NextResponse } from "next/server";
import crypto from "crypto";
import * as React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseLive, isEmailDryRun } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send-email";
import { marketingSendGuard } from "@/lib/outreach/send-guard";
import { personalize, firstNameFrom } from "@/lib/outreach/personalize";
import { recordLeadActivity } from "@/lib/outreach/activity";
import OutreachSequenceEmail from "@/emails/outreach-sequence-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function timingEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  try {
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (
    !secret ||
    !authHeader.startsWith("Bearer ") ||
    !timingEqual(authHeader.slice(7), secret)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseLive()) {
    return NextResponse.json({ processed: 0, reason: "database not configured" });
  }

  const now = new Date().toISOString();
  const { data: due } = await supabaseAdmin
    .from("outreach_enrollments")
    .select("id, campaign_id, lead_id, email, current_step, status")
    .eq("status", "ACTIVE")
    .lte("next_send_at", now)
    .order("next_send_at", { ascending: true })
    .limit(20);

  const results: Array<{ enrollment: string; ok: boolean; reason?: string }> = [];

  for (const row of due || []) {
    const { data: campaign } = await supabaseAdmin
      .from("outreach_campaigns")
      .select("id, status, dry_run, name")
      .eq("id", row.campaign_id)
      .maybeSingle();

    if (!campaign || campaign.status !== "ACTIVE") {
      results.push({ enrollment: row.id, ok: false, reason: "campaign_not_active" });
      continue;
    }

    const guard = await marketingSendGuard({
      email: row.email,
      leadId: row.lead_id,
    });
    if (!guard.ok) {
      await supabaseAdmin
        .from("outreach_enrollments")
        .update({
          status: "STOPPED",
          stop_reason: guard.reason,
          updated_at: now,
        })
        .eq("id", row.id);
      results.push({ enrollment: row.id, ok: false, reason: guard.reason });
      continue;
    }

    const { data: steps } = await supabaseAdmin
      .from("outreach_sequence_steps")
      .select("*")
      .eq("campaign_id", row.campaign_id)
      .order("step_order", { ascending: true });

    const step = steps?.[row.current_step];
    if (!step) {
      await supabaseAdmin
        .from("outreach_enrollments")
        .update({ status: "COMPLETED", updated_at: now })
        .eq("id", row.id);
      results.push({ enrollment: row.id, ok: true, reason: "sequence_complete" });
      continue;
    }

    let fullName = "";
    if (row.lead_id) {
      const { data: lead } = await supabaseAdmin
        .from("contact_leads")
        .select("name")
        .eq("id", row.lead_id)
        .maybeSingle();
      fullName = String(lead?.name || "");
    }
    const first = firstNameFrom(fullName);
    const firstNameBlock = first ? ` ${first}` : "";

    const subject = personalize(step.subject, {
      firstName: first,
      fullName,
      firstNameBlock,
    });
    let bodyHtml = personalize(step.body_html, {
      firstName: first,
      fullName,
      firstNameBlock,
    });
    bodyHtml = bodyHtml.replace(/\{\{firstNameBlock\}\}/g, firstNameBlock);

    const idempotencyKey = `outreach:${row.campaign_id}:${row.id}:step:${row.current_step}`;

    if (campaign.dry_run || isEmailDryRun()) {
      await recordLeadActivity({
        leadId: row.lead_id,
        email: row.email,
        eventType: "email_queued",
        campaignId: row.campaign_id,
        enrollmentId: row.id,
        actor: "cron",
        metadata: { dry_run: true, step: row.current_step, subject },
      });
    } else {
      const sendResult = await sendEmail({
        to: guard.email,
        from: "hello",
        subject,
        react: React.createElement(OutreachSequenceEmail, {
          subject,
          bodyHtml,
        }),
        category: "marketing",
        eventType: "outreach_sequence",
        templateKey: step.template_key || "outreach-sequence",
        idempotencyKey,
        listUnsubscribeEmail: guard.email,
      });

      if (!sendResult.success) {
        results.push({
          enrollment: row.id,
          ok: false,
          reason: sendResult.error || "send_failed",
        });
        continue;
      }

      await recordLeadActivity({
        leadId: row.lead_id,
        email: row.email,
        eventType: "email_sent",
        campaignId: row.campaign_id,
        enrollmentId: row.id,
        actor: "cron",
        metadata: { step: row.current_step, subject },
      });
    }

    const nextOrder = row.current_step + 1;
    const nextStep = steps?.[nextOrder];
    if (!nextStep) {
      await supabaseAdmin
        .from("outreach_enrollments")
        .update({
          status: "COMPLETED",
          current_step: nextOrder,
          last_sent_at: now,
          updated_at: now,
        })
        .eq("id", row.id);
    } else {
      const nextAt = new Date(
        Date.now() + Math.max(0, nextStep.delay_days) * 86400000
      ).toISOString();
      await supabaseAdmin
        .from("outreach_enrollments")
        .update({
          current_step: nextOrder,
          last_sent_at: now,
          next_send_at: nextAt,
          updated_at: now,
        })
        .eq("id", row.id);
    }

    if (row.lead_id) {
      await supabaseAdmin
        .from("contact_leads")
        .update({
          communication_status: "SENT",
          last_contacted_at: now,
          lifecycle_stage: "CONTACTED",
        })
        .eq("id", row.lead_id);
    }

    results.push({ enrollment: row.id, ok: true });
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
