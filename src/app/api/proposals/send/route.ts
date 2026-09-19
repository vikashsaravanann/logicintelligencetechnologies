import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import ProposalSentEmail from "@/emails/proposal-sent-email";
import { COMPANY } from "@/config/company";

const sendProposalSchema = z.object({
  proposalId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = sendProposalSchema.parse(body);

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("id", validated.proposalId)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (!proposal.client_email) {
      return NextResponse.json({ error: "Client email is missing" }, { status: 400 });
    }

    // Construct the full URL using the request headers or fallback
    const host = req.headers.get("host") || "logicintelligence.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const proposalUrl = `${protocol}://${host}/proposal/${proposal.secure_token}`;

    const { success, message } = await sendEmail({
      to: proposal.client_email,
      subject: `Project Proposal: ${proposal.title} - ${COMPANY.name}`,
      react: ProposalSentEmail({
        fullName: proposal.client_name,
        proposalUrl,
      }),
      category: "transactional",
    });

    if (!success) {
      console.error("Failed to send proposal email:", message);
      return NextResponse.json(
        { error: "Failed to send email", details: message },
        { status: 500 }
      );
    }

    // Update the proposal status to 'Sent' if it's currently generated or new
    // Assuming we want to track that it was explicitly sent.
    await supabaseAdmin
      .from("proposals")
      .update({ status: "Sent" })
      .eq("id", proposal.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    console.error("Send proposal error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
