import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, FileText, Globe } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Proposal Dossier | Admin Command Center",
};

export default async function AdminProposalDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: proposal, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !proposal) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <Link
        href="/admin/proposals"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Proposals</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-1">
            Status: {proposal.status}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            {proposal.title}
          </h1>
          <p className="text-zinc-400 text-sm">
            Client: {proposal.client_name} ({proposal.client_email})
          </p>
        </div>

        <Link
          href={`/proposal/${proposal.secure_token}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"
        >
          <span>Open Public Link</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <span className="text-xs text-zinc-500 font-bold uppercase block mb-1">Investment</span>
          <span className="text-2xl font-black text-white">
            {proposal.currency === "INR" ? "₹" : "$"}{Number(proposal.pricing).toLocaleString()}
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <span className="text-xs text-zinc-500 font-bold uppercase block mb-1">Timeline</span>
          <span className="text-2xl font-black text-white">{proposal.timeline}</span>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <span className="text-xs text-zinc-500 font-bold uppercase block mb-1">Created At</span>
          <span className="text-lg font-bold text-zinc-300">
            {new Date(proposal.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Public Client Token Link
        </h2>
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs text-zinc-300">
          <span className="truncate">/proposal/{proposal.secure_token}</span>
          <Link
            href={`/proposal/${proposal.secure_token}`}
            target="_blank"
            className="text-primary hover:underline font-bold shrink-0 ml-4"
          >
            Visit
          </Link>
        </div>
      </div>
    </div>
  );
}
