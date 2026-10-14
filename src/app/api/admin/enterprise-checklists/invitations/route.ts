import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { createChecklistInvitation } from "@/lib/enterprise-checklist/invitations";

export const dynamic = "force-dynamic";

const createInvitationSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required").max(160),
  recipientEmail: z.string().email("Valid recipient email is required").max(200),
  recipientCompany: z.string().max(200).optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  ttlDays: z.number().int().min(1).max(90).default(30),
});

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "checklists.read");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const status = searchParams.get("status")?.trim().toLowerCase() || "";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    let query = supabaseAdmin
      .from("enterprise_checklist_invitations")
      .select(
        `id, recipient_name, recipient_email, recipient_company, status, expires_at, sent_at,
         sent_count, viewed_at, submitted_at, revoked_at, proposal_id, created_by, internal_notes, created_at,
         enterprise_checklist_responses(id, confirmation_reference, selected_count, submitted_at, client_notes),
         enterprise_checklist_versions(document_title, document_version, checkpoint_count, phase_count)`,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`recipient_name.ilike.%${search}%,recipient_email.ilike.%${search}%,recipient_company.ilike.%${search}%`);
    }

    const { data: invitations, count, error } = await query;

    if (error) {
      console.error("[EnterpriseChecklists Admin GET] Query error:", error);
      return NextResponse.json({ error: "Failed to retrieve checklist invitations." }, { status: 500 });
    }

    return NextResponse.json({
      invitations: invitations || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("[EnterpriseChecklists Admin GET] Exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "checklists.write");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const body = await req.json().catch(() => null);
    const validated = createInvitationSchema.parse(body);

    const created = await createChecklistInvitation({
      recipientName: validated.recipientName,
      recipientEmail: validated.recipientEmail,
      recipientCompany: validated.recipientCompany,
      clientId: validated.clientId,
      notes: validated.notes,
      createdBy: actor.email,
      ttlDays: validated.ttlDays,
    });

    if (!created) {
      return NextResponse.json({ error: "Failed to create checklist invitation." }, { status: 500 });
    }

    await recordAdminAction({
      actor: { userId: actor.userId, email: actor.email, role: actor.role },
      action: "enterprise_checklist.invitation_created",
      outcome: "succeeded",
      target: { type: "enterprise_checklist_invitation", id: created.invitationId },
      metadata: {
        recipientName: validated.recipientName,
        recipientEmail: validated.recipientEmail,
        company: validated.recipientCompany,
        expiresAt: created.expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      invitation: created,
    }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("[EnterpriseChecklists Admin POST] Exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
