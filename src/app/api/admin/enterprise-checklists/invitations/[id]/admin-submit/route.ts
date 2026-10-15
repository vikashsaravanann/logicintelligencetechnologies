import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { recordAdminChecklistIntake } from "@/lib/enterprise-checklist/invitations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const adminSubmitSchema = z.object({
  selectedPoints: z.array(z.number().int().min(1).max(50)).min(1, "Select at least 1 checkpoint").max(50),
  submitterName: z.string().max(100).optional(),
  internalNotes: z.string().max(4000).optional(),
  notifyClient: z.boolean().default(true),
});

export async function POST(req: NextRequest, { params }: Props) {
  const auth = await requireCapabilityApi(req, "checklists.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const body = await req.json().catch(() => ({}));
    const validated = adminSubmitSchema.safeParse(body);

    if (!validated.success) {
      const issue = validated.error.issues[0]?.message || "Invalid submission parameters.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const result = await recordAdminChecklistIntake(id, {
      selectedPoints: validated.data.selectedPoints,
      submitterName: validated.data.submitterName || `LIT Admin (${actor.email})`,
      internalNotes: validated.data.internalNotes,
      notifyClient: validated.data.notifyClient,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    await recordAdminAction({
      actor: {
        userId: actor.userId,
        email: actor.email,
        role: actor.role,
      },
      action: "enterprise_checklist.admin_submit",
      capability: "checklists.write",
      target: { type: "enterprise_checklist_invitation", id },
      outcome: "succeeded",
      metadata: {
        selectedCount: result.selectedCount,
        confirmationReference: result.confirmationReference,
        notifyClient: validated.data.notifyClient,
      },
      request: req,
    });

    return NextResponse.json({
      ok: true,
      message: result.message,
      confirmationReference: result.confirmationReference,
      selectedCount: result.selectedCount,
      submittedAt: result.submittedAt,
    });
  } catch (err: any) {
    console.error("[EnterpriseChecklist Admin Submit] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process admin scope submission." },
      { status: 500 }
    );
  }
}
