import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { getDocumentType } from "@/config/documents";
import { nextStatuses, type DocumentStatus } from "@/lib/documents/lifecycle";
import { DocumentActions } from "../document-actions";
import { uploadVersion, verifyLatest, downloadVersion } from "../actions";
import { AdminBackLink } from "../../components/AdminBackLink";
import {
  FileText,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Clock,
  Hash,
  Lock,
  GitBranch,
  History,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Document Metadata Inspector | Admin | Logic Intelligence Technologies",
  description: "Cryptographic inspection, immutable version ledger, and lifecycle status management.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DOC_TONE: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  in_review: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-blue-200 bg-blue-50 text-blue-800",
  issued: "border-emerald-200 bg-emerald-50 text-emerald-800",
  superseded: "border-slate-200 bg-slate-100 text-slate-600",
  void: "border-rose-200 bg-rose-50 text-rose-800",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: Props) {
  await requireCapabilityPage("documents.read", "/admin/documents");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [docRes, versionsRes] = await Promise.all([
    supabaseAdmin
      .from("client_documents")
      .select("id, doc_type, reference, title, status, classification, client_id")
      .eq("id", id)
      .maybeSingle(),
    supabaseAdmin
      .from("client_document_versions")
      .select("id, version_no, sha256, size_bytes, created_at, note")
      .eq("document_id", id)
      .order("version_no", { ascending: false }),
  ]);

  const doc = docRes.data;
  if (!doc) notFound();

  let clientDisplayName = null;
  if (doc.client_id) {
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("display_name, legal_name, client_code")
      .eq("id", doc.client_id)
      .maybeSingle();
    clientDisplayName = client?.display_name || client?.legal_name || client?.client_code;
  }

  const versions = versionsRes.data ?? [];
  const docType = getDocumentType(doc.doc_type);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Navigation & Header */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <AdminBackLink href="/admin/documents" label="Document Vault" />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
            <FileText className="w-3 h-3" />
            {docType?.name ?? doc.doc_type}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
            {doc.reference}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono ${
              DOC_TONE[doc.status] ?? DOC_TONE.draft
            }`}
          >
            {doc.status}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
            <Lock className="w-2.5 h-2.5" />
            {doc.classification}
          </span>
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
          {doc.title}
        </h1>
        <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
          {clientDisplayName ? (
            <>
              Client: <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{clientDisplayName}</span> &middot;{" "}
            </>
          ) : null}
          Reference: <span className="font-mono text-[var(--lit-navy,#0B2545)]">{doc.reference}</span>
        </p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Status
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)] uppercase">
              {doc.status}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">State machine stage</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Revisions
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <History className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-[var(--lit-blue,#1565C0)]">
              {versions.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Immutable versions</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Type Prefix
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Hash className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {docType?.referencePrefix ?? "LIT-DOC"}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Standard registry</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Classification
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold font-mono tracking-tight text-[var(--lit-navy,#0B2545)] block truncate">
              {doc.classification}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Access control rule</p>
          </div>
        </div>
      </div>

      {/* Lifecycle Transitions Panel */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          <span className="p-1 rounded-md bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
            <GitBranch className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
            Lifecycle State Machine Transitions
          </h2>
        </div>

        <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
          Authorized transition actions trigger verified state changes, audit logs, and document lock status.
        </p>

        <DocumentActions
          documentId={doc.id}
          status={doc.status}
          nextStatuses={nextStatuses(doc.status as DocumentStatus)}
        />
      </div>

      {/* Cryptographic Version Ledger */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
              <History className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Cryptographic Version Ledger ({versions.length})
            </h2>
          </div>
        </div>

        {versions.length === 0 ? (
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] py-3">No revisions uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
            {versions.map((v) => (
              <li key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-1 last:pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                      v{v.version_no}
                    </span>
                    <span className="font-mono text-xs text-[var(--lit-text-muted,#52677C)]" title={v.sha256}>
                      SHA-256: {v.sha256.slice(0, 16)}…
                    </span>
                  </div>
                  {v.note ? (
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1 italic">
                      Note: {v.note}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                    <span>{(v.size_bytes / 1024).toFixed(1)} KB</span>
                    <span className="mx-1.5">&middot;</span>
                    <span>{formatIST(v.created_at, "datetime")}</span>
                  </div>

                  <form action={downloadVersion}>
                    <input type="hidden" name="versionId" value={v.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-blue-500 hover:text-blue-600 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Upload Revision & Integrity Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Version */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
              <Upload className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Upload Signed / Revision PDF
            </h2>
          </div>

          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Uploading an executed or amended document appends a new immutable version with SHA-256 digest validation.
          </p>

          <form action={uploadVersion} className="space-y-4">
            <input type="hidden" name="documentId" value={doc.id} />
            <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/50 p-3">
              <input
                type="file"
                name="file"
                accept="application/pdf"
                required
                className="w-full text-xs text-[var(--lit-navy,#0B2545)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--lit-navy,#0B2545)] file:text-white hover:file:bg-[var(--lit-navy,#0B2545)]/90 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Revision</span>
            </button>
          </form>
        </div>

        {/* Cryptographic Integrity Verification */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Cryptographic Integrity Audit
            </h2>
          </div>

          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Recomputes the SHA-256 checksum of the latest stored binary in the vault and verifies byte-for-byte fidelity against the ledger.
          </p>

          <form action={verifyLatest} className="pt-2">
            <input type="hidden" name="documentId" value={doc.id} />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 hover:bg-slate-100 text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verify Latest Version Integrity</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
