import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { DOCUMENT_TYPES, getDocumentType } from "@/config/documents";
import { AdminBackLink } from "../components/AdminBackLink";
import {
  Files,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Hash,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Managed Document Vault | Admin | Logic Intelligence Technologies",
  description: "Standard document registry, cryptographic version ledger, and background render jobs.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const DOC_TONE: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  in_review: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-blue-200 bg-blue-50 text-blue-800",
  issued: "border-emerald-200 bg-emerald-50 text-emerald-800",
  superseded: "border-slate-200 bg-slate-100 text-slate-600",
  void: "border-rose-200 bg-rose-50 text-rose-800",
};

const JOB_TONE: Record<string, string> = {
  queued: "border-slate-200 bg-slate-50 text-slate-700",
  claimed: "border-blue-200 bg-blue-50 text-blue-800",
  rendering: "border-blue-200 bg-blue-50 text-blue-800",
  succeeded: "border-emerald-200 bg-emerald-50 text-emerald-800",
  failed: "border-rose-200 bg-rose-50 text-rose-800",
  dead_letter: "border-rose-200 bg-rose-50 text-rose-800",
};

export default async function DocumentsPage() {
  await requireCapabilityPage("documents.read", "/admin/documents");

  const [docsRes, jobsRes] = await Promise.all([
    supabaseAdmin
      .from("client_documents")
      .select("id, doc_type, reference, title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("document_render_jobs")
      .select("id, status, attempts, error, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const docs = docsRes.data ?? [];
  const jobs = jobsRes.data ?? [];

  const totalDocs = docs.length;
  const issuedCount = docs.filter((d) => d.status === "issued").length;
  const inReviewCount = docs.filter((d) => d.status === "in_review" || d.status === "draft").length;
  const jobsCount = jobs.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Files className="w-3 h-3" />
              Document Center
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              SHA-256 Ledger
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Managed Document Vault
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Standard document registry, cryptographic version ledger, and automated background render pipeline.
          </p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Documents
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Files className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {docsRes.error ? "—" : totalDocs}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Managed client files</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Master Types
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-blue,#1565C0)]">
              {Object.keys(DOCUMENT_TYPES).length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Approved master templates</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Issued & Active
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {docsRes.error ? "—" : issuedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Production documents</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Render Queue
            </span>
            <span className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700">
              <Cpu className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-purple-700">
              {jobsRes.error ? "—" : jobsCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Background jobs tracked</p>
          </div>
        </div>
      </div>

      {/* Document Registry: 7 Master Types */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
            Approved Master Templates & Schema Registry
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(DOCUMENT_TYPES).map((t) => (
            <div
              key={t.key}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">{t.name}</h3>
                <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 font-mono text-[10px] font-bold text-[var(--lit-navy,#0B2545)] shrink-0">
                  {t.referencePrefix}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  {t.masterStatus === "MASTER_UPLOADED" ? "Master Uploaded" : t.masterStatus}
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  {t.templateStatus === "REQUIRES_HUMAN_ACTION" ? "Human Review Required" : t.templateStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] text-[11px] text-[var(--lit-text-muted,#52677C)] space-y-1">
                <div className="flex items-center justify-between">
                  <span>Signature required:</span>
                  <span className="font-semibold text-[var(--lit-navy,#0B2545)]">
                    {t.requiresSignature ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span>SHA-256:</span>
                  <span className="text-slate-500 truncate max-w-[140px]" title={t.masterSha256}>
                    {t.masterSha256.slice(0, 12)}…
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documents Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Managed Client Documents ({docs.length})
            </h2>
          </div>
        </div>

        {docsRes.error ? (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-800 shadow-2xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Could not load documents from database.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                      {getDocumentType(d.doc_type)?.name ?? d.doc_type}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                      {d.reference}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/documents/${d.id}`}
                        className="font-semibold text-[var(--lit-navy,#0B2545)] hover:text-blue-600 transition-colors"
                      >
                        {d.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono ${
                          DOC_TONE[d.status] ?? DOC_TONE.draft
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--lit-text-muted,#52677C)]">
                      {formatIST(d.created_at, "date")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/documents/${d.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-blue-500 hover:text-blue-600 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--lit-text-muted,#52677C)]">
                      No documents registered in vault yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Render Jobs Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700">
            <Cpu className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
            Background Render Jobs ({jobs.length})
          </h2>
        </div>

        {jobsRes.error ? (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-800 shadow-2xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Could not load background render jobs.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Attempts</th>
                  <th className="px-5 py-3.5">Error Message</th>
                  <th className="px-5 py-3.5">Created Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono ${
                          JOB_TONE[j.status] ?? JOB_TONE.queued
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {j.attempts}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--lit-text-muted,#52677C)]">
                      {j.error ? (
                        <span className="text-rose-600 font-mono text-xs">{j.error}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                      {formatIST(j.created_at, "datetime")}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-[var(--lit-text-muted,#52677C)]">
                      No active background render jobs.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
