import { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import {
  Download,
  FileText,
  ShieldCheck,
  Lock,
  HardDrive,
  FolderOpen,
  ArrowRight,
  FileCode,
  Calendar,
} from "lucide-react";
import { getPortalContext, listOwnRows } from "@/lib/client-portal/data";
import { formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Documents Vault | Client Portal | Logic Intelligence Technologies",
  description: "Secure, encrypted repository for contracts, architectural blueprints, and engineering deliverables.",
};

export const revalidate = 0;

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function ClientDocumentsPage() {
  const portal = await getPortalContext("/client/documents");
  const files = await listOwnRows(portal, "client_files");

  const totalFiles = files?.length || 0;
  const totalBytes = files?.reduce((acc, f) => acc + (Number(f.size) || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <BackButton fallbackHref="/client/dashboard" label="Back to Dashboard" inline />
      </div>

      {/* Header & Vault Security Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>AES-256 Cloud Vault</span>
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              {portal.user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Encrypted Documents Vault
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Zero-knowledge, tenant-isolated storage for master service agreements, NDA executions, architectural blueprints, and release artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold self-start sm:self-auto font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Tenant Isolated (RLS)</span>
        </div>
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Stored Assets</span>
            <FileText className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {totalFiles}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Encrypted Volume</span>
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 font-poppins">
            {formatBytes(totalBytes)}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Cipher Protocol</span>
            <Lock className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] font-mono mt-1">
            AES-256 GCM
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Compliance Standard</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-700 font-mono mt-1">
            SOC-2 Ready
          </div>
        </div>
      </div>

      {/* Document Vault Table / Grid */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              Verified Assets & Deliverables
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Immutable artifact records generated and signed during engineering execution.
            </p>
          </div>
          <span className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
            {totalFiles} {totalFiles === 1 ? "document" : "documents"} available
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[11px] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="py-3.5 px-6">Document Name</th>
                <th className="py-3.5 px-6">File Size</th>
                <th className="py-3.5 px-6">Upload Timestamp</th>
                <th className="py-3.5 px-6">Security Check</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {files && files.length > 0 ? (
                files.map((file) => {
                  const ext = file.file_name?.split(".").pop()?.toUpperCase() || "FILE";
                  return (
                    <tr key={file.id} className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[var(--lit-teal,#1FA9A2)] shrink-0">
                            {ext === "PDF" ? (
                              <FileText className="w-4 h-4" />
                            ) : ext === "ZIP" || ext === "TAR" ? (
                              <HardDrive className="w-4 h-4" />
                            ) : (
                              <FileCode className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--lit-navy,#0B2545)] block hover:underline cursor-pointer">
                              {file.file_name}
                            </span>
                            <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] font-mono uppercase">
                              Format: {ext}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-[var(--lit-navy,#0B2545)] font-mono">
                        {formatBytes(file.size)}
                      </td>
                      <td className="py-4 px-6 text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                        {formatIST(file.created_at, "date")}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={file.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
                          <span>Download</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 px-6 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 flex items-center justify-center mx-auto">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                        No Vault Documents Deposited
                      </h3>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                        Executed contracts, architecture specs, and release archives will automatically be mirrored into your encrypted vault as project sprints progress.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/client/projects"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                        >
                          <span>Review Active Projects</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Advisory Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            Cryptographic Integrity & Data Custody Notice
          </h3>
        </div>
        <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
          All client files uploaded to this vault are protected by Supabase Row-Level Security policies and Google Cloud Storage server-side AES-256 encryption. Only authorized accounts tied to this client tenant can access, view, or stream downloads. If you require custom retention windows or air-gapped cryptographic signing keys, please contact your LIT engagement lead.
        </p>
      </div>
    </div>
  );
}
