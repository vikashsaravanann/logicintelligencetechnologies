import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProposalViewerClient from "./components/ProposalViewerClient";

interface Props {
  params: Promise<{ secureToken: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secureToken } = await params;
  return {
    title: "Client Proposal & Statement of Work | Logic Intelligence Technologies",
    description: "Confidential technical proposal and implementation specification.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ProposalPage({ params }: Props) {
  const { secureToken } = await params;

  const { data: proposal, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .eq("secure_token", secureToken)
    .single();

  if (error || !proposal) {
    notFound();
  }

  // Record viewed status if it's currently 'Sent'
  if (proposal.status === "Sent") {
    await supabaseAdmin
      .from("proposals")
      .update({ status: "Viewed" })
      .eq("id", proposal.id);
    proposal.status = "Viewed";
  }

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-10 right-1/4 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <ProposalViewerClient proposal={proposal} />
      </div>
    </div>
  );
}
