import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, Calendar, FileText, ArrowRight, CheckCircle2, ShieldCheck, Plus } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateLeadScore } from "@/lib/crm/scoring";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Lead Dossier & Intelligence | Admin Command Center",
};

export default async function AdminLeadDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: lead, error } = await supabaseAdmin
    .from("contact_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    notFound();
  }

  const scoring = calculateLeadScore({
    email: lead.email,
    company: lead.company,
    phone: lead.phone,
    message: lead.message,
    budget: lead.budget,
  });

  return (
    <div className="container mx-auto p-4 py-8 max-w-5xl space-y-8">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Leads Ledger</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-1">
            CRM Lead Dossier · ID: {lead.id.slice(0, 8)}
          </span>
          <h1 className="text-3xl font-black text-white">{lead.name}</h1>
          <p className="text-xs text-zinc-400 mt-1">{lead.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/proposals/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Proposal</span>
          </Link>
        </div>
      </div>

      {/* Scoring and Key Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <span className="text-xs font-bold text-zinc-500 uppercase block mb-1">Intent Score</span>
          <div className="text-3xl font-black text-white">{scoring.score} / 100</div>
          <span className="text-xs text-primary font-bold uppercase mt-1 block">
            Category: {scoring.category.replace("_", " ")}
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <span className="text-xs font-bold text-zinc-500 uppercase block mb-1">Pipeline Stage</span>
          <div className="text-2xl font-bold text-white uppercase tracking-tight">
            {lead.pipeline_stage || "New Lead"}
          </div>
          <span className="text-xs text-zinc-400 block mt-1">Owner: {lead.assigned_owner || "Unassigned"}</span>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <span className="text-xs font-bold text-zinc-500 uppercase block mb-1">Inquiry Date</span>
          <div className="text-xl font-bold text-zinc-200">
            {new Date(lead.created_at).toLocaleDateString()}
          </div>
          <span className="text-xs text-zinc-500 block mt-1">{new Date(lead.created_at).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Lead Message and Requirements */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span>Inbound Project Scope & Notes</span>
        </h2>
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {lead.message || "No custom message provided during submission."}
        </div>
      </div>

      {/* Scoring Breakdown Breakdown */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Deterministic Scoring Factors</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(scoring.breakdown).map(([factor, points]) => (
            <div key={factor} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">{factor}</span>
              <span className="text-emerald-400 font-bold">+{points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
