import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const reviewSchema = z.object({
  reviewNotes: z.string().max(4000).optional(),
  status: z.enum(["reviewed", "proposal_prepared"]).default("reviewed"),
});

export async function POST(
  req: NextRequest,
  { params }: Props
) {
  const auth = await requireCapabilityApi(req, "checklists.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const body = await req.json().catch(() => ({}));
    const validated = reviewSchema.parse(body);

    const { data: inv, error: invErr } = await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .select("id, status")
      .eq("id", id)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    // Insert review record
    const { error: reviewErr } = await supabaseAdmin
      .from("enterprise_checklist_reviews")
      .insert({
        invitation_id: id,
        reviewed_by: actor.email,
        review_notes: validated.reviewNotes || null,
        created_at: new Date().toISOString(),
      });

    if (reviewErr) {
      console.warn("[EnterpriseChecklist Review] Note:", reviewErr.message);
    }

    // Update invitation status
    const { error: updateErr } = await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .update({
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update review status." }, { status: 500 });
    }

    await recordAdminAction({
      actor: { userId: actor.userId, email: actor.email, role: actor.role },
      action: "enterprise_checklist.invitation_reviewed",
      outcome: "succeeded",
      target: { type: "enterprise_checklist_invitation", id },
      metadata: {
        reviewer: actor.email,
        status: validated.status,
        notes: validated.reviewNotes,
      },
    });

    return NextResponse.json({ ok: true, status: validated.status });
  } catch (err: any) {
    console.error("[EnterpriseChecklists Admin Review] Exception:", err);
    return NextResponse.json({ error: "Server error occurred while saving review." }, { status: 500 });
  }
}
