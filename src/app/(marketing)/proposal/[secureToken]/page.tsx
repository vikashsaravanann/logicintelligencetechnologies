import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProposalViewerClient from "./components/ProposalViewerClient";
import BackButton from "@/components/navigation/back-button";

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
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Return to Home" inline />
        </div>
        <ProposalViewerClient proposal={proposal} />
      </div>
    </main>
  );
}
