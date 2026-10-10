import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../../components/AdminBackLink";
import { formatIST, formatMoney } from "@/lib/format/datetime";
import {
  FileSignature,
  Clock,
  Eye,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Calendar,
  Building2,
  Mail,
  User,
  ShieldCheck,
  Layers,
  PackageCheck,
  FileText,
  KeyRound,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Proposal Dossier | Admin | Logic Intelligence Technologies",
  description: "Inspect commercial terms, project scope, deliverable milestones, and public client access.",
  robots: {
    index: false,
    follow: false,
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Draft: {
    label: "Draft",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock,
  },
  Sent: {
    label: "Sent",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  Viewed: {
    label: "Viewed",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Eye,
  },
  Approved: {
    label: "Approved",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
};

export default async function AdminProposalDetailPage({ params }: Props) {
  await requireCapabilityPage("proposals.read", "/admin/proposals");
  const { id } = await params;

  const { data: proposal, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !proposal) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[proposal.status] ?? {
    label: proposal.status,
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock,
  };
  const StatusIcon = statusConfig.icon;

  const scopeList = Array.isArray(proposal.scope) ? proposal.scope : [];
  const deliverablesList = Array.isArray(proposal.deliverables) ? proposal.deliverables : [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/proposals" label="Proposal Registry" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <FileSignature className="w-3 h-3" />
              {proposal.reference ?? "LIT-PROP"}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusConfig.badge}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Token: {proposal.secure_token?.slice(0, 10)}…
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            {proposal.title}
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Client: <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{proposal.client_name}</span>{" "}
            &middot; {proposal.client_email}
            {proposal.client_company ? ` · ${proposal.client_company}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/proposal/${proposal.secure_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
          >
            <span>Open Public Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Investment
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {formatMoney(proposal.pricing, proposal.currency || "INR")}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Contract value</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Timeline
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {proposal.timeline || "—"}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Delivery window</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Status
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <StatusIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {proposal.status}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Lifecycle state</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Registered
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold font-mono tracking-tight text-[var(--lit-navy,#0B2545)] block truncate">
              {formatIST(proposal.created_at, "date")}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {formatIST(proposal.created_at, "time")}
            </p>
          </div>
        </div>
      </div>

      {/* Client & Public Access Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Counterparty Dossier */}
        <div className="lg:col-span-1 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
              <User className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Client Details
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-0.5">
                Full Name
              </span>
              <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{proposal.client_name}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-0.5">
                Email Address
              </span>
              <span className="font-mono text-[var(--lit-navy,#0B2545)]">{proposal.client_email}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-0.5">
                Organization / Company
              </span>
              <span className="text-[var(--lit-navy,#0B2545)]">
                {proposal.client_company || "Direct Client"}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-0.5">
                Proposal ID
              </span>
              <span className="font-mono text-[10px] text-[var(--lit-text-muted,#52677C)] break-all">
                {proposal.id}
              </span>
            </div>
          </div>
        </div>

        {/* Public Client Token & Link */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
              <KeyRound className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Public Client Access Link
            </h2>
          </div>

          <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
            This encrypted, tokenized link allows the recipient to view, review, and digitally approve this proposal without requiring a LIT system login.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between gap-3 text-xs">
            <span className="font-mono text-xs text-[var(--lit-navy,#0B2545)] truncate">
              /proposal/{proposal.secure_token}
            </span>
            <Link
              href={`/proposal/${proposal.secure_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shrink-0"
            >
              <span>Visit</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scope & Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scope Items */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Technical Scope Items
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
              {scopeList.length} items
            </span>
          </div>

          {scopeList.length === 0 ? (
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] py-2">No scope items recorded.</p>
          ) : (
            <div className="space-y-2">
              {scopeList.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-navy,#0B2545)]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-mono font-bold text-[var(--lit-text-muted,#52677C)] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Deliverables */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
                <PackageCheck className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Key Deliverables & Artifacts
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
              {deliverablesList.length} deliverables
            </span>
          </div>

          {deliverablesList.length === 0 ? (
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] py-2">No deliverables recorded.</p>
          ) : (
            <div className="space-y-2">
              {deliverablesList.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-navy,#0B2545)]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-mono font-bold text-[var(--lit-text-muted,#52677C)] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      {proposal.terms ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Commercial Terms & Warranty
            </h2>
          </div>

          <div className="rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] p-4 text-xs text-[var(--lit-navy,#0B2545)] leading-relaxed whitespace-pre-wrap">
            {proposal.terms}
          </div>
        </div>
      ) : null}
    </div>
  );
}
