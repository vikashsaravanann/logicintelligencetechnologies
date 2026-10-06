import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send-email";
import VoiceShieldAccessGrantedEmail from "@/../emails/voiceshield-access-granted-email";
import * as React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COMPANY } from "@/config/company";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";
import { isValidEmail, sanitizePersonName } from "@/lib/email/validation";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const parsed = z.object({ leadId: z.string().uuid() })
      .safeParse(await readBoundedAiJson(req));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid approval request" },
        { status: 400 }
      );
    }
    const { leadId } = parsed.data;
    const { data: lead, error: lookupError } = await supabaseAdmin.from("contact_leads")
      .select("id, name, email, message").eq("id", leadId).maybeSingle();
    if (lookupError) return NextResponse.json({ success: false, message: "Approval service unavailable" }, { status: 503 });
    if (!lead || !isValidEmail(lead.email)) return NextResponse.json({ success: false, message: "Request not found or cannot be approved" }, { status: 404 });
    const email = lead.email;
    const fullName = sanitizePersonName(lead.name || "VoiceShield user");
    const accessType = sanitizePersonName(lead.message?.match(/Access type:\s*([^\r\n]+)/i)?.[1] || "Demo", 80);

    const consoleUrl = COMPANY.products.voiceShield.consoleUrl;

    // Send the access email
    const emailResult = await sendEmail({
      to: email,
      from: "hello",
      subject: "Your VoiceShield access has been approved — Logic Intelligence Technologies",
      category: "transactional",
      eventType: "voiceshield-access-granted",
      templateKey: "voiceshield-access-granted-email",
      idempotencyKey: `voiceshield-access:${leadId}`,
      react: React.createElement(VoiceShieldAccessGrantedEmail, {
        fullName,
        consoleUrl,
        accessType: accessType || "Demo",
      }),
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: "Could not send approval email" },
        { status: 502 }
      );
    }
    // A skipped send (suppressed/unsubscribed recipient) means no access email
    // reached the client — do NOT grant access on a silent skip.
    if (emailResult.status === "skipped") {
      return NextResponse.json(
        { success: false, message: "Approval email was skipped (recipient suppressed or unsubscribed); access was not granted." },
        { status: 409 }
      );
    }

    // Update the lead's pipeline stage to "Access Granted"
    const { error: updateError } = await supabaseAdmin
      .from("contact_leads")
      .update({ pipeline_stage: "Access Granted" })
      .eq("id", leadId);

    const { recordAdminAction } = await import("@/lib/admin/audit");
    await recordAdminAction({
      actor: { userId: auth.userId, email: auth.email, role: auth.role },
      action: "voiceshield.access_grant",
      capability: "voiceshield.approve",
      target: { type: "contact_lead", id: leadId },
      outcome: updateError ? "failed" : "succeeded",
      metadata: { emailStatus: emailResult.status },
      errorCode: updateError ? "pipeline_update_failed" : undefined,
      request: req,
    });

    if (updateError) return NextResponse.json({ success: false, message: "Email accepted, but approval status could not be saved. Contact support before retrying." }, { status: 503 });

    return NextResponse.json({
      success: true,
      message: "Approval email accepted for sending",
    });
  } catch (error) {
    if (error instanceof InvalidAiRequest) return NextResponse.json({ success: false, message: "Invalid approval request" }, { status: 400 });
    console.error("[VoiceShield Approve] request failed");
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
