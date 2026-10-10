import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProposalViewerClient from "./components/ProposalViewerClient";
import PageShell from "@/components/layout/page-shell";

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

  // View tracking is recorded asynchronously by the client component on mount.
  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <ProposalViewerClient proposal={proposal} />
      </div>
    </PageShell>
  );
}
