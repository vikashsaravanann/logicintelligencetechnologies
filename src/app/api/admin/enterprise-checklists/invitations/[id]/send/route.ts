import { NextRequest, NextResponse } from "next/server";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { sendChecklistInvitationEmail } from "@/lib/enterprise-checklist/invitations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: NextRequest,
  { params }: Props
) {
  const auth = await requireCapabilityApi(req, "checklists.send");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const result = await sendChecklistInvitationEmail(id);

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    await recordAdminAction({
      actor: { userId: actor.userId, email: actor.email, role: actor.role },
      action: "enterprise_checklist.invitation_sent",
      outcome: "succeeded",
      target: { type: "enterprise_checklist_invitation", id },
      metadata: {
        dispatchedBy: actor.email,
      },
    });

    return NextResponse.json({ ok: true, message: result.message });
  } catch (err: any) {
    console.error("[EnterpriseChecklists Admin Send] Exception:", err);
    return NextResponse.json({ error: "Failed to dispatch invitation email." }, { status: 500 });
  }
}
