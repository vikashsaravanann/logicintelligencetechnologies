import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { ENTERPRISE_CHECKPOINTS } from "@/data/enterpriseDeploymentChecklist";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: NextRequest,
  { params }: Props
) {
  const auth = await requireCapabilityApi(req, "proposals.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    // 1. Fetch invitation and response
    const { data: inv, error: invErr } = await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .select("id, recipient_name, recipient_email, recipient_company, client_id, proposal_id")
      .eq("id", id)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ error: "Checklist invitation not found." }, { status: 404 });
    }

    if (inv.proposal_id) {
      return NextResponse.json({
        ok: true,
        message: "A proposal draft has already been created for this checklist.",
        proposalId: inv.proposal_id,
      });
    }

    // 2. Fetch selected points
    const { data: resp } = await supabaseAdmin
      .from("enterprise_checklist_responses")
      .select("id, confirmation_reference, client_notes")
      .eq("invitation_id", inv.id)
      .maybeSingle();

    let selectedNumbers: number[] = [];
    if (resp) {
      const { data: items } = await supabaseAdmin
        .from("enterprise_checklist_response_items")
        .select("point_number")
        .eq("response_id", resp.id)
        .order("point_number", { ascending: true });

      selectedNumbers = (items || []).map((i) => i.point_number);
    }

    const selectedDetails = ENTERPRISE_CHECKPOINTS.filter((c) => selectedNumbers.includes(c.number));

    // 3. Build scope and deliverables from checkpoints
    const scopeItems = selectedDetails.map(
      (c) => `[Checkpoint ${c.number}] ${c.title}: ${c.engineering_requirement}`
    );

    const deliverables = selectedDetails.map(
      (c) => `[Verification ${c.number}] ${c.title}: ${c.verification_evidence}`
    );

    // 4. Generate reference
    let reference = `LIT-PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: rpcRef } = await supabaseAdmin.rpc("next_reference", {
      p_prefix: "LIT-PROP",
    });
    if (rpcRef) {
      reference = rpcRef;
    }

    const secureToken = uuidv4().replace(/-/g, "").slice(0, 24);
    const companyLabel = inv.recipient_company ? ` · ${inv.recipient_company}` : "";

    // 5. Insert proposal in Draft status
    const { data: proposal, error: propErr } = await supabaseAdmin
      .from("proposals")
      .insert({
        secure_token: secureToken,
        reference,
        client_name: inv.recipient_name,
        client_email: inv.recipient_email,
        client_company: inv.recipient_company || null,
        title: `Enterprise Engineering Statement of Work${companyLabel}`,
        scope: scopeItems.length > 0 ? scopeItems : ["Standard Enterprise Architecture Review and Implementation"],
        deliverables: deliverables.length > 0 ? deliverables : ["Verified Production Deployment Architecture"],
        milestones: [
          { name: "Phase 1: Architecture & Requirements Baseline", percentage: 25, duration: "Week 1-2" },
          { name: "Phase 2: Core Engineering & System Integration", percentage: 50, duration: "Week 3-6" },
          { name: "Phase 3: QA Verification & Client Handover", percentage: 25, duration: "Week 7-8" },
        ],
        timeline: "6-8 Weeks",
        pricing: 0, // Preliminary / requires founder commercial approval
        currency: "INR",
        terms: "Standard commercial terms subject to review and final pricing sign-off.",
        status: "draft",
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id, secure_token")
      .single();

    if (propErr || !proposal) {
      console.error("[CreateProposalDraft] Insert failed:", propErr);
      return NextResponse.json({ error: "Failed to create proposal draft." }, { status: 500 });
    }

    // 6. Link proposal to invitation
    await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .update({
        proposal_id: proposal.id,
        status: "proposal_prepared",
        updated_at: new Date().toISOString(),
      })
      .eq("id", inv.id);

    await recordAdminAction({
      actor: { userId: actor.userId, email: actor.email, role: actor.role },
      action: "enterprise_checklist.proposal_draft_created",
      outcome: "succeeded",
      target: { type: "proposal", id: proposal.id },
      metadata: {
        invitationId: inv.id,
        reference,
        selectedCheckpointsCount: selectedNumbers.length,
      },
    });

    return NextResponse.json({
      ok: true,
      proposalId: proposal.id,
      secureToken: proposal.secure_token,
      reference,
    });
  } catch (err: any) {
    console.error("[CreateProposalDraft] Exception:", err);
    return NextResponse.json({ error: "Server error occurred while drafting proposal." }, { status: 500 });
  }
}
