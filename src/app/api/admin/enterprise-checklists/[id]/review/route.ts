import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCapabilityApi } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordAdminAction } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  reviewStatus: z.enum(["reviewed", "clarification_requested", "scope_confirmed"]),
  internalNotes: z.string().max(2000).optional(),
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const auth = await requireCapabilityApi(req, "checklists.write");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid review parameters." }, { status: 400 });
    }

    const { data: inv } = await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .select("id, status, enterprise_checklist_responses(id)")
      .eq("id", id)
      .single();

    if (!inv) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    const responseId = (inv.enterprise_checklist_responses as any)?.[0]?.id || (inv.enterprise_checklist_responses as any)?.id;
    if (!responseId) {
      return NextResponse.json({ error: "Cannot review an invitation without a submitted response." }, { status: 400 });
    }

    // Upsert review record
    await supabaseAdmin
      .from("enterprise_checklist_reviews")
      .upsert({
        response_id: responseId,
        reviewer_email: actor.email || "staff@logicintelligencetechnologies.in",
        review_status: parsed.data.reviewStatus,
        internal_notes: parsed.data.internalNotes || null,
        reviewed_at: new Date().toISOString(),
      }, { onConflict: "response_id" });

    // Update invitation status
    await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .update({
        status: "reviewed",
        internal_notes: parsed.data.internalNotes || undefined,
      })
      .eq("id", id);

    await recordAdminAction({
      actor,
      action: "checklist.record_review",
      capability: "checklists.write",
      target: { type: "checklist_invitation", id },
      outcome: "succeeded",
      metadata: { reviewStatus: parsed.data.reviewStatus },
      request: req,
    });

    return NextResponse.json({ success: true, message: "Review recorded successfully." });
  } catch (err) {
    console.error("[Admin Checklist API] Review error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
