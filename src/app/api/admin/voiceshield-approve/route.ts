import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send-email";
import VoiceShieldAccessGrantedEmail from "@/../emails/voiceshield-access-granted-email";
import * as React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COMPANY } from "@/config/company";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, email, fullName, accessType } = body;

    if (!leadId || !email || !fullName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: leadId, email, fullName" },
        { status: 400 }
      );
    }

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
        { success: false, message: emailResult.message || "Failed to send email" },
        { status: 500 }
      );
    }

    // Update the lead's pipeline stage to "Access Granted"
    await supabaseAdmin
      .from("contact_leads")
      .update({ pipeline_stage: "Access Granted" })
      .eq("id", leadId);

    return NextResponse.json({
      success: true,
      message: `Access email sent to ${email}`,
    });
  } catch (error) {
    console.error("[VoiceShield Approve] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
