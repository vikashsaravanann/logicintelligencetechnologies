import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST, formatINR } from "@/lib/format/datetime";
import { getDocumentType } from "@/config/documents";
import { AdminBackLink } from "../../components/AdminBackLink";
import {
  Building2,
  Mail,
  User,
  Calendar,
  FileSignature,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Activity,
  FileCheck,
  PenTool,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CLIENT_CONFIG: Record<string, { label: string; badge: string }> = {
  prospect: { label: "Prospect", badge: "border-blue-200 bg-blue-50 text-blue-700" },
  active: { label: "Active", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  paused: { label: "Paused", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  closed: { label: "Closed", badge: "border-slate-200 bg-slate-50 text-slate-700" },
};

const CONTRACT_CONFIG: Record<string, { label: string; badge: string }> = {
  draft: { label: "Draft", badge: "border-slate-200 bg-slate-50 text-slate-700" },
  sent: { label: "Sent for Review", badge: "border-amber-200 bg-amber-50 text-amber-800" },
  signed: { label: "Executed & Signed", badge: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  void: { label: "Void", badge: "border-rose-200 bg-rose-50 text-rose-800" },
};

const DOC_CONFIG: Record<string, { label: string; badge: string }> = {
  draft: { label: "Draft", badge: "border-slate-200 bg-slate-50 text-slate-700" },
  in_review: { label: "In Review", badge: "border-amber-200 bg-amber-50 text-amber-800" },
  approved: { label: "Approved", badge: "border-blue-200 bg-blue-50 text-blue-800" },
  issued: { label: "Issued", badge: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  superseded: { label: "Superseded", badge: "border-slate-200 bg-slate-100 text-slate-600" },
  void: { label: "Void", badge: "border-rose-200 bg-rose-50 text-rose-800" },
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) {
    return {
      title: "Client Dossier | Admin | Logic Intelligence Technologies",
      robots: { index: false, follow: false },
    };
  }

  const { data } = await supabaseAdmin
    .from("clients")
    .select("legal_name, client_code")
    .eq("id", id)
    .maybeSingle();

  return {
    title: `${data?.legal_name || "Client"} (${data?.client_code || "CLI"}) | Client Dossier | Admin`,
    description: "Enterprise client organization dossier, signed legal contracts, document vault, and project allocation.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ClientDetailPage({ params }: Props) {
  await requireCapabilityPage("clients.read", "/admin/clients");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [clientRes, contractsRes, documentsRes, projectRes, eventsRes] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id, client_code, legal_name, display_name, contact_name, contact_email, status, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("client_contracts")
      .select("id, reference, contract_type, status, provenance, signatory_name, signatory_email, signed_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("client_documents")
      .select("id, doc_type, reference, title, status, classification, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("projects")
      .select("id, project_code, name, status, value")
      .eq("client_id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("automation_events")
      .select("id, event_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const client = clientRes.data;
  if (!client) notFound();

  const contracts = contractsRes.data ?? [];
  const documents = documentsRes.data ?? [];
  const project = projectRes.data;
  const events = eventsRes.data ?? [];

  const clientCfg = CLIENT_CONFIG[client.status] ?? CLIENT_CONFIG.closed;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/clients" label="Client Directory" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Building2 className="w-3 h-3" />
              {client.client_code}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${clientCfg.badge}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {clientCfg.label}
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            {client.legal_name}
          </h1>
          {client.display_name && client.display_name !== client.legal_name && (
            <p className="text-sm font-medium text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Operating as: {client.display_name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] font-semibold text-xs tracking-wider hover:border-[var(--lit-teal,#1FA9A2)] transition-all shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Document Vault</span>
          </Link>
        </div>
      </div>

      {/* Key Dossier Information Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <User className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            Primary Contact
          </div>
          <div className="mt-2">
            <div className="font-bold text-sm text-[var(--lit-navy,#0B2545)] truncate">
              {client.contact_name ?? "Not assigned"}
            </div>
            {client.contact_email ? (
              <a
                href={`mailto:${client.contact_email}`}
                className="font-mono text-xs text-[var(--lit-teal,#1FA9A2)] hover:underline truncate block mt-0.5"
              >
                {client.contact_email}
              </a>
            ) : (
              <span className="text-xs text-slate-400 mt-0.5 block">No email recorded</span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
            Enrolled In System
          </div>
          <div className="mt-2">
            <div className="font-bold text-sm font-mono text-[var(--lit-navy,#0B2545)]">
              {formatIST(client.created_at, "date")}
            </div>
            <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              IST time zone
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <FileSignature className="w-3.5 h-3.5 text-amber-600" />
            Contracts & SOWs
          </div>
          <div className="mt-2">
            <div className="font-extrabold text-2xl font-mono text-[var(--lit-navy,#0B2545)]">
              {contracts.length}
            </div>
            <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              {contracts.filter((c) => c.status === "signed").length} executed
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            Active Project
          </div>
          <div className="mt-2">
            <div className="font-bold text-sm text-[var(--lit-navy,#0B2545)] truncate">
              {project ? project.name : "None assigned"}
            </div>
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              {project ? formatINR(project.value) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Contracts Section */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Legal Contracts & Statements of Work
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
            {contracts.length} {contracts.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="p-6">
          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <FileSignature className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-[var(--lit-text-muted,#52677C)]">
                No active contracts or SOW agreements on file for this organization.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((c) => {
                const cfg = CONTRACT_CONFIG[c.status] ?? CONTRACT_CONFIG.draft;
                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/40 hover:bg-white hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[var(--lit-navy,#0B2545)]">
                          {c.reference}
                        </span>
                        <span className="text-xs font-semibold text-[var(--lit-text-muted,#52677C)]">
                          {c.contract_type} Agreement
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${cfg.badge}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </div>

                    {c.status === "signed" ? (
                      <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--lit-text-muted,#52677C)]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Executed by <strong className="text-[var(--lit-navy,#0B2545)]">{c.signatory_name ?? "Signatory"}</strong>
                            {c.signatory_email ? ` (${c.signatory_email})` : ""}
                          </span>
                        </div>
                        <div className="font-mono text-[11px]">
                          {c.provenance === "manual_upload" ? "Manual counter-signature upload" : c.provenance ?? "Electronic"} · {formatIST(c.signed_at, "datetime")}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                        <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                          Pending counter-execution and signature verification.
                        </span>
                        <Link
                          href={`/admin/contracts/${c.id}/record-signature`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Record Signature</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Document Vault & Governance Records
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </span>
        </div>

        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-[var(--lit-text-muted,#52677C)]">
                No governance documents generated for this account yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {documents.map((d) => {
                const cfg = DOC_CONFIG[d.status] ?? DOC_CONFIG.draft;
                const docMeta = getDocumentType(d.doc_type);
                return (
                  <div
                    key={d.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/admin/documents/${d.id}`}
                        className="font-bold text-sm text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors flex items-center gap-2"
                      >
                        <span>{d.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--lit-teal,#1FA9A2)]" />
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-[var(--lit-text-muted,#52677C)]">
                        <span className="font-semibold">{docMeta?.name ?? d.doc_type}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                          {d.reference}
                        </span>
                        {d.classification && (
                          <>
                            <span>·</span>
                            <span className="uppercase text-[10px] font-mono tracking-wider font-semibold text-slate-500">
                              {d.classification.replace(/_/g, " ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${cfg.badge}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                      <Link
                        href={`/admin/documents/${d.id}`}
                        className="p-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-teal,#1FA9A2)] hover:border-[var(--lit-teal,#1FA9A2)] transition-colors"
                        title="View Document Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Associated Project */}
      {project && (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Active Engineering Project
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
              {project.project_code}
            </span>
          </div>

          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[var(--lit-navy,#0B2545)]">
                {project.project_code}
              </span>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mt-1">
                {project.name}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">
                {formatINR(project.value)}
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mt-1">
                {project.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Automation Events Strip */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Recent System & Telemetry Events
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
            Audit Stream
          </span>
        </div>

        <div className="p-6">
          {events.length === 0 ? (
            <p className="text-sm text-[var(--lit-text-muted,#52677C)] text-center py-4">
              No recent automation events recorded.
            </p>
          ) : (
            <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-semibold text-[var(--lit-navy,#0B2545)]">
                      {e.event_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase font-mono text-slate-600">
                      {e.status}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--lit-text-muted,#52677C)]">
                      {formatIST(e.created_at, "datetime")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
