"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Upload,
  FileText,
  FileCheck,
  Download,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  Search,
  Filter,
} from "lucide-react";
import { SafeEmployeeWorkspaceDTO } from "@/lib/workspaces/types";

interface Props {
  workspace: SafeEmployeeWorkspaceDTO;
}

interface WalletDoc {
  id: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  category: string;
  description: string | null;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  identity: "Identity Proof (Passport/Aadhaar/PAN)",
  educational: "Educational / Degree Certificate",
  certification: "Professional Certification",
  employment: "Offer Letter / Employment Contract",
  tax_compliance: "Tax / Compliance Documents",
  project_note: "Project Delivery Note",
  other: "Other Verified Record",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function WalletManagerClient({ workspace }: Props) {
  const [documents, setDocuments] = useState<WalletDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("identity");
  const [description, setDescription] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/workspaces/${workspace.workspaceId}/wallet`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load documents");
      }
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [workspace.workspaceId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 52428800) {
      setError("File exceeds 50 MB limit. Please select a smaller file.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      const res = await fetch(`/api/admin/workspaces/${workspace.workspaceId}/wallet`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload document");
      }

      setSuccess(`Document "${file.name}" securely encrypted and saved to wallet.`);
      setFile(null);
      setDescription("");
      const inputEl = document.getElementById("wallet-file-input") as HTMLInputElement;
      if (inputEl) inputEl.value = "";

      await loadDocuments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      setError(null);
      const res = await fetch(
        `/api/admin/workspaces/${workspace.workspaceId}/wallet?docId=${docId}`
      );
      const data = await res.json();
      if (!res.ok || !data.downloadUrl) {
        throw new Error(data.error || "Failed to generate download URL");
      }
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (docId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${fileName}" from your wallet?`)) {
      return;
    }

    try {
      setError(null);
      const res = await fetch(
        `/api/admin/workspaces/${workspace.workspaceId}/wallet?docId=${docId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete document");
      }
      setSuccess(`Document "${fileName}" deleted.`);
      await loadDocuments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesSearch =
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Privacy Policy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" /> Private Document Wallet
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Encrypted personal vault for official documents, certifications, and contracts. Maximum 50 MB per file.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tenant Isolated & Signed URLs (15-min TTL)</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs">
          <FileCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-5 shadow-2xs">
        <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          <Upload className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" /> Upload Document to Wallet
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Select File (Max 50 MB)
              </label>
              <input
                id="wallet-file-input"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.txt"
                className="w-full text-xs text-[var(--lit-ink,#121826)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-teal-200 file:text-xs file:font-bold file:uppercase file:bg-teal-50 file:text-[var(--lit-teal,#1FA9A2)] hover:file:bg-teal-100/70 file:cursor-pointer border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-2 bg-white shadow-2xs"
              />
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
                Supported: PDF, Word, Excel, PNG, JPG, WebP, TXT.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
                className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs cursor-pointer"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              placeholder="e.g., Aadhaar card verified for tax onboarding, issued 2024"
              className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading Encrypted Document...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2 text-[var(--lit-navy,#0B2545)] font-semibold focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs cursor-pointer"
          >
            <option value="all">All Categories ({documents.length})</option>
            {Object.entries(CATEGORY_LABELS).map(([k, label]) => {
              const count = documents.filter((d) => d.category === k).length;
              return (
                <option key={k} value={k}>
                  {label} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-12 text-center text-[var(--lit-text-muted,#52677C)] shadow-2xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--lit-teal,#1FA9A2)]" />
          <span className="text-xs">Loading wallet documents...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-12 text-center space-y-3 shadow-2xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">No documents found</h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
            {searchQuery || categoryFilter !== "all"
              ? "No documents match your active filters."
              : "Upload your official verification documents, certificates, or employment agreements above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 space-y-3 shadow-2xs hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] truncate" title={doc.file_name}>
                      {doc.file_name}
                    </h4>
                    <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {CATEGORY_LABELS[doc.category] || doc.category}
                    </span>
                  </div>
                </div>
              </div>

              {doc.description && (
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] line-clamp-2 italic">
                  &ldquo;{doc.description}&rdquo;
                </p>
              )}

              <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)]">
                <div className="flex items-center gap-3 font-medium">
                  <span>{formatBytes(doc.file_size_bytes)}</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.file_name)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider border border-emerald-200 transition-all shadow-2xs cursor-pointer"
                    title="Generate 15-minute signed download URL"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id, doc.file_name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
