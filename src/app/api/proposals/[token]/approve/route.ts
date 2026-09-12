import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { enqueueEmail } from "@/lib/email/outbox";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json().catch(() => ({}));
    const signerName = body?.signerName || "Client Representative";

    // 1. Fetch proposal
    const { data: proposal, error: fetchError } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("secure_token", token)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ error: "Proposal not found or invalid token." }, { status: 404 });
    }

    if (proposal.status === "Approved") {
      return NextResponse.json({ success: true, message: "Proposal already approved." });
    }

    // 2. Mark Approved
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("proposals")
      .update({
        status: "Approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", proposal.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Create Project record automatically in CRM
    try {
      const projectCode = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
      await supabaseAdmin.from("projects").insert({
        project_code: projectCode,
        client_name: proposal.client_name,
        name: proposal.title,
        status: "Planning",
        progress: 0,
        value: proposal.pricing,
      });
    } catch (projErr) {
      console.warn("[Auto-Project Creation]", projErr);
    }

    // 4. Notify admin via outbox email
    try {
      await enqueueEmail({
        recipient: "info@logicintelligencetechnologies.in",
        subject: `🎉 PROPOSAL APPROVED: ${proposal.title} by ${proposal.client_name}`,
        templateId: "proposal_approved_notification",
        metadata: {
          proposalId: proposal.id,
          clientName: proposal.client_name,
          clientEmail: proposal.client_email,
          signerName,
          value: proposal.pricing,
          currency: proposal.currency,
        },
      });
    } catch (emailErr) {
      console.warn("[Outbox Proposal Notification]", emailErr);
    }

    return NextResponse.json({ success: true, proposal: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
