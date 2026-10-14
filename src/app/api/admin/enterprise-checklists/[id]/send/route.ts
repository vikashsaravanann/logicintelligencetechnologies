import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { sendChecklistInvitationEmail, generateWhatsAppShareContent } from "@/lib/enterprise-checklist/invitations";
import { recordAdminAction } from "@/lib/admin/audit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COMPANY } from "@/config/company";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const auth = await requireCapabilityApi(req, "checklists.send");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const channel = body.channel || "email"; // "email" | "whatsapp"

    const { data: inv } = await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .select("id, recipient_name, recipient_email, recipient_company, token_hash")
      .eq("id", id)
      .single();

    if (!inv) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (channel === "whatsapp") {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, "");
      // For whatsapp share link generation, we need an active token or direct link
      const inviteUrl = `${siteUrl}/enterprise-checklist`;
      const share = generateWhatsAppShareContent(inv.recipient_name, inviteUrl);

      await recordAdminAction({
        actor,
        action: "checklist.generate_whatsapp_share",
        capability: "checklists.send",
        target: { type: "checklist_invitation", id: inv.id },
        outcome: "succeeded",
        request: req,
      });

      return NextResponse.json({ success: true, shareText: share.text, shareUrl: share.shareUrl });
    }

    const sendRes = await sendChecklistInvitationEmail(id);

    await recordAdminAction({
      actor,
      action: "checklist.send_invitation_email",
      capability: "checklists.send",
      target: { type: "checklist_invitation", id: inv.id },
      outcome: sendRes.ok ? "succeeded" : "failed",
      metadata: { error: sendRes.ok ? undefined : sendRes.message },
      request: req,
    });

    if (!sendRes.ok) {
      return NextResponse.json({ error: sendRes.message }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: sendRes.message });
  } catch (err) {
    console.error("[Admin Checklist API] Send error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
