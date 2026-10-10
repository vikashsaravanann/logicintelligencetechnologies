import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import ProposalSentEmail from "@/emails/proposal-sent-email";
import { COMPANY } from "@/config/company";
import { requireCapabilityApi } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";

const sendProposalSchema = z.object({ proposalId: z.string().uuid() });

export const dynamic = "force-dynamic";

// A proposal can be (re)sent only from these states.
const SENDABLE = new Set(["Draft", "Sent", "Viewed"]);

export async function POST(req: NextRequest) {
  const auth = await requireCapabilityApi(req, "proposals.send");
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const actor = { userId: auth.session.userId, email: auth.session.email, role: auth.session.role };
  try {
    const body = await req.json().catch(() => null);
    const { proposalId } = sendProposalSchema.parse(body);

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    if (!SENDABLE.has(proposal.status)) {
      return NextResponse.json(
        { error: `A ${proposal.status} proposal cannot be sent.` },
        { status: 409 },
      );
    }
    if (!proposal.client_email) {
      return NextResponse.json({ error: "Client email is missing" }, { status: 400 });
    }

    // Always link to the canonical site; never trust the request Host header.
    const proposalUrl = `${COMPANY.websiteUrl}/proposal/${proposal.secure_token}`;

    const result = await sendEmail({
      to: proposal.client_email,
      from: "admin",
      subject: `Project Proposal: ${proposal.title} - ${COMPANY.displayName}`,
      react: ProposalSentEmail({ fullName: proposal.client_name, proposalUrl }),
      category: "transactional",
    });

    const delivered = result.success && result.status !== "skipped";

    // Mark Sent ONLY after the email actually went out (or was queued). A
    // skipped/failed send leaves the proposal in its prior state.
    if (delivered) {
      await supabaseAdmin
        .from("proposals")
        .update({
          status: "Sent",
          sent_at: new Date().toISOString(),
          sent_count: (proposal.sent_count ?? 0) + 1,
        })
        .eq("id", proposal.id);
    }

    await recordAdminAction({
      actor,
      action: "proposal.send",
      capability: "proposals.send",
      target: { type: "proposal", id: proposal.id },
      outcome: delivered ? "succeeded" : "failed",
      metadata: { emailStatus: result.status },
      errorCode: delivered ? undefined : "email_not_delivered",
      request: req,
    });

    if (!delivered) {
      return NextResponse.json(
        { error: "The proposal email was not sent", emailStatus: result.status },
        { status: 502 },
      );
    }
    return NextResponse.json({ success: true, emailStatus: result.status }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    console.error("Send proposal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
