import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCapabilityApi } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordAdminAction } from "@/lib/admin/audit";
import { ENTERPRISE_CHECKPOINTS } from "@/data/enterpriseDeploymentChecklist";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const proposalDraftSchema = z.object({
  title: z.string().min(5).max(200),
  timeline: z.string().min(2).max(100).default("4-6 Weeks"),
  pricing: z.number().min(0),
  currency: z.string().default("INR"),
  terms: z.string().max(2000).optional(),
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const auth = await requireCapabilityApi(req, "proposals.write");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = proposalDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid proposal draft parameters." }, { status: 400 });
    }

    // Fetch invitation, client info, and selected points
    const { data: inv } = await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .select(`
        id, recipient_name, recipient_email, recipient_company, proposal_id,
        enterprise_checklist_responses(
          id, confirmation_reference,
          enterprise_checklist_response_items(point_number)
        )
      `)
      .eq("id", id)
      .single();

    if (!inv) {
      return NextResponse.json({ error: "Checklist invitation not found." }, { status: 404 });
    }

    const response = (inv.enterprise_checklist_responses as any)?.[0] || inv.enterprise_checklist_responses;
    if (!response) {
      return NextResponse.json({ error: "No submitted checklist response found for this invitation." }, { status: 400 });
    }

    const responseItems = response.enterprise_checklist_response_items || [];
    const selectedNums: number[] = responseItems.map((item: any) => item.point_number);

    // Format selected points into candidate scope items
    const candidateScope = ENTERPRISE_CHECKPOINTS.filter((c) => selectedNums.includes(c.number)).map(
      (c) => `[SOP ${String(c.number).padStart(2, "0")}] ${c.title} — ${c.engineering_requirement.slice(0, 120)}...`
    );

    const defaultDeliverables = [
      "Production-grade application deployment & DNS verification",
      "Full source code repository handover & intellectual property transfer",
      "Automated CI/CD test gates & environment configuration matrix",
      "Technical architecture documentation & 30-day post-launch warranty support",
    ];

    const secureToken = randomBytes(24).toString("hex");
    const defaultTerms = parsed.data.terms ||
      "50% advance milestone upon acceptance; 50% upon final verification. Source code and IP transferred on final receipt. Includes 30 days post-launch warranty.";

    // Insert proposal in Draft status
    const { data: prop, error: propErr } = await supabaseAdmin
      .from("proposals")
      .insert({
        title: parsed.data.title,
        client_name: inv.recipient_name,
        client_email: inv.recipient_email,
        client_company: inv.recipient_company || null,
        status: "Draft",
        pricing: parsed.data.pricing,
        currency: parsed.data.currency,
        timeline: parsed.data.timeline,
        scope: candidateScope.length > 0 ? candidateScope : ["Core platform architecture implementation"],
        deliverables: defaultDeliverables,
        terms: defaultTerms,
        secure_token: secureToken,
      })
      .select("id")
      .single();

    if (propErr || !prop) {
      console.error("[Checklist -> Proposal] Create draft error:", propErr);
      return NextResponse.json({ error: "Could not create proposal draft." }, { status: 500 });
    }

    // Link proposal to invitation and mark proposal_prepared
    await supabaseAdmin
      .from("enterprise_checklist_invitations")
      .update({
        proposal_id: prop.id,
        status: "proposal_prepared",
      })
      .eq("id", id);

    await recordAdminAction({
      actor,
      action: "proposal.create_from_checklist",
      capability: "proposals.write",
      target: { type: "proposal", id: prop.id },
      outcome: "succeeded",
      metadata: { checklistInvitationId: id, selectedCount: selectedNums.length },
      request: req,
    });

    return NextResponse.json({
      success: true,
      proposalId: prop.id,
      message: "Editable proposal draft created successfully.",
    });
  } catch (err) {
    console.error("[Checklist -> Proposal] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
