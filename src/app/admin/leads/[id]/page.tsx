import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  Plus,
  Compass,
  DollarSign,
  Clock,
  Globe,
  Tag,
  Sparkles,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateLeadScore } from "@/lib/crm/scoring";
import { LeadActions } from "./lead-actions";
import { AdminBackLink } from "../../components/AdminBackLink";
import { formatIST } from "@/lib/format/datetime";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Lead Dossier & Intelligence | Logic Intelligence Technologies",
  description: "Comprehensive qualification dossier, intent breakdown, and communication dispatch for inbound enterprise lead.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLeadDetailPage({ params }: Props) {
  await requireCapabilityPage("leads.read", "/admin/leads");
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
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/leads" label="CRM Leads Ledger" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3" />
              CRM Lead Dossier · ID: {lead.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            {lead.name}
          </h1>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1 font-mono">
            {lead.email} {lead.company ? `· ${lead.company}` : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <LeadActions email={lead.email} name={lead.name} />

          <Link
            href="/admin/proposals/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Proposal</span>
          </Link>
        </div>
      </div>

      {/* Scoring and Key Attributes Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
              Intent Score
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] border border-[var(--lit-teal,#1FA9A2)]/20">
              {scoring.category.replace("_", " ")}
            </span>
          </div>
          <div className="text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight mt-2">
            {scoring.score} <span className="text-lg text-[var(--lit-text-muted,#52677C)] font-normal">/ 100</span>
          </div>
          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-medium mt-1 block">
            Automated multi-factor evaluation
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block mb-1">
            Pipeline Stage
          </span>
          <div className="text-2xl font-black text-[var(--lit-navy,#0B2545)] uppercase tracking-tight mt-2">
            {lead.pipeline_stage || "New Lead"}
          </div>
          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-medium block mt-1">
            Owner: <strong className="text-[var(--lit-navy,#0B2545)]">{lead.assigned_owner || "Unassigned"}</strong>
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block mb-1">
            Inquiry Timestamp
          </span>
          <div className="text-base font-black text-[var(--lit-navy,#0B2545)] font-mono mt-2">
            {formatIST(lead.created_at)}
          </div>
          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-medium block mt-1">
            Recorded in Indian Standard Time
          </span>
        </div>
      </div>

      {/* Structured contact attributes */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          <Building2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
          <span>Contact Coordinates & Project Scope</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <Mail className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Email Address
              </span>
              <a
                href={`mailto:${lead.email}`}
                className="text-[var(--lit-navy,#0B2545)] font-semibold hover:text-[var(--lit-teal,#1FA9A2)] hover:underline break-all"
              >
                {lead.email}
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <Phone className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Direct Phone
              </span>
              <span className="text-[var(--lit-navy,#0B2545)] font-mono font-semibold">
                {lead.phone || "—"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <Building2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Company / Organization
              </span>
              <span className="text-[var(--lit-navy,#0B2545)] font-semibold">
                {lead.company || "—"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <Tag className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Project Category
              </span>
              <span className="text-[var(--lit-navy,#0B2545)] font-semibold">
                {lead.project_type || "—"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <DollarSign className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Estimated Budget
              </span>
              <span className="text-[var(--lit-navy,#0B2545)] font-semibold">
                {lead.budget || "—"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <Clock className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Delivery Timeline
              </span>
              <span className="text-[var(--lit-navy,#0B2545)] font-semibold">
                {lead.timeline || "—"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <Compass className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Acquisition Channel
              </span>
              <span className="text-[var(--lit-navy,#0B2545)] font-semibold">
                {lead.source || "—"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
            <Globe className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block">
                Intake Referral URL
              </span>
              <span className="text-[var(--lit-text-muted,#52677C)] font-mono text-[11px] break-all">
                {lead.page_url || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Message and Requirements */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          <FileText className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
          <span>Inbound Project Scope & Narrative</span>
        </h2>
        <div className="p-5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-ink,#121826)] leading-relaxed whitespace-pre-line font-mono">
          {lead.message || "No custom message provided during intake submission."}
        </div>
      </div>

      {/* Deterministic Scoring Factors Breakdown */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Deterministic Qualification Scoring Factors</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(scoring.breakdown).map(([factor, points]) => (
            <div
              key={factor}
              className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs"
            >
              <span className="text-[var(--lit-navy,#0B2545)] font-semibold">{factor}</span>
              <span className="text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                +{points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
