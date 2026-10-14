import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCapabilityApi } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createChecklistInvitation } from "@/lib/enterprise-checklist/invitations";
import { recordAdminAction } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  recipientName: z.string().min(2, "Name must be at least 2 characters").max(100),
  recipientEmail: z.string().email("Invalid email address").max(254),
  recipientCompany: z.string().max(100).optional(),
  clientId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  ttlDays: z.number().int().min(1).max(90).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "checklists.read");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    let dbQuery = supabaseAdmin
      .from("enterprise_checklist_invitations")
      .select(
        `id, client_id, recipient_name, recipient_email, recipient_company, status,
         expires_at, sent_at, sent_count, viewed_at, submitted_at, revoked_at,
         proposal_id, internal_notes, created_at,
         enterprise_checklist_responses(confirmation_reference, selected_count, submitted_at)`
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (status && status !== "all") {
      dbQuery = dbQuery.eq("status", status);
    }
    if (query) {
      dbQuery = dbQuery.or(
        `recipient_name.ilike.%${query}%,recipient_email.ilike.%${query}%,recipient_company.ilike.%${query}%`
      );
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error("[Admin Checklist API] Fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch invitations." }, { status: 500 });
    }

    return NextResponse.json({ success: true, invitations: data || [] });
  } catch (err) {
    console.error("[Admin Checklist API] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "checklists.write");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };

  try {
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Validation failed.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const created = await createChecklistInvitation({
      recipientName: parsed.data.recipientName,
      recipientEmail: parsed.data.recipientEmail,
      recipientCompany: parsed.data.recipientCompany,
      clientId: parsed.data.clientId,
      notes: parsed.data.notes,
      createdBy: actor.email || actor.userId,
      ttlDays: parsed.data.ttlDays,
    });

    if (!created) {
      return NextResponse.json({ error: "Could not create invitation." }, { status: 500 });
    }

    await recordAdminAction({
      actor,
      action: "checklist.create_invitation",
      capability: "checklists.write",
      target: { type: "checklist_invitation", id: created.invitationId },
      outcome: "succeeded",
      metadata: {
        recipientEmail: parsed.data.recipientEmail,
        recipientCompany: parsed.data.recipientCompany,
      },
      request: req,
    });

    return NextResponse.json({
      success: true,
      invitationId: created.invitationId,
      url: created.url,
      expiresAt: created.expiresAt,
    });
  } catch (err) {
    console.error("[Admin Checklist API] Create error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
