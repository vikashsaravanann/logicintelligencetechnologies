"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  FileCode,
  FolderSync,
  RefreshCw,
  FileCheck,
} from "lucide-react";

type WorkflowAction = "created" | "exists" | "error";

interface ImportResponse {
  state?: "ok" | "not_configured" | "error";
  detail?: string;
  results?: { name: string; action: WorkflowAction }[];
  error?: string;
}

export default function ImportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "warn" | "error">("ok");
  const [results, setResults] = useState<{ name: string; action: WorkflowAction }[] | null>(null);
  const [customFile, setCustomFile] = useState<{ name: string; size: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function runImport() {
    setLoading(true);
    setSummary(null);
    setResults(null);
    try {
      const res = await fetch("/api/admin/automations/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const body = (await res.json().catch(() => ({}))) as ImportResponse;

      if (body.state === "not_configured") {
        setTone("warn");
        setSummary(body.detail ?? "n8n engine is not configured (N8N_BASE_URL or N8N_API_KEY missing).");
        return;
      }
      if (!res.ok || body.state === "error" || body.error) {
        setTone("error");
        setSummary(body.detail ?? body.error ?? `Import failed with status HTTP ${res.status}.`);
        return;
      }

      const resResults = body.results ?? [];
      setResults(resResults);
      const created = resResults.filter((r) => r.action === "created").length;
      const exists = resResults.filter((r) => r.action === "exists").length;
      const errors = resResults.filter((r) => r.action === "error").length;

      if (errors > 0) {
        setTone("error");
        setSummary(`${created} created, ${exists} already present, ${errors} error(s).`);
      } else {
        setTone("ok");
        setSummary(`${created} workflow(s) created, ${exists} already registered and preserved.`);
      }
    } catch {
      setTone("error");
      setSummary("Could not reach the automation import endpoint.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    if (!file.name.endsWith(".json")) {
      setFileError("Workflow definition must be a valid JSON file (.json).");
      setCustomFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid format");
        }
        setCustomFile({ name: file.name, size: file.size });
      } catch {
        setFileError("Selected file is not valid JSON.");
        setCustomFile(null);
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)]"
        >
          <FolderSync className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
          <span>Sync Workflow Definitions</span>
        </button>

        {summary && !isOpen ? (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              tone === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : tone === "warn"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {tone === "ok" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : tone === "warn" ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            )}
            {summary}
          </span>
        ) : null}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div
            className="relative w-full max-w-lg rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xl space-y-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
                  <UploadCloud className="w-5 h-5" />
                </span>
                <div>
                  <h3 id="import-modal-title" className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                    Import Workflow Definitions
                  </h3>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                    Synchronize bundled n8n automation blueprints into your active engine
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-slate-200 bg-[var(--lit-cloud,#F7F9FC)] p-3.5 text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-[var(--lit-navy,#0B2545)]">
                Bundled Blueprint Registry:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[var(--lit-text-muted,#52677C)]">
                <li>
                  <span className="font-mono text-slate-800">LIT — Contract Signed</span>: Provisions onboarding token and dispatches client kickoff sequence.
                </li>
                <li>
                  <span className="font-mono text-slate-800">LIT — Onboarding Submitted</span>: Enqueues credentials, spins infrastructure steps, and registers audit events.
                </li>
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">
                Note: Workflows are imported in an inactive staging state to prevent accidental live execution without verification.
              </p>
            </div>

            {/* Custom File Upload Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Upload Custom Workflow JSON (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--lit-blue,#1565C0)] hover:bg-blue-50/20 transition-all"
              >
                {customFile ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 font-medium">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>{customFile.name} ({(customFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <FileCode className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">
                      Click to inspect an external workflow definition JSON
                    </span>
                    <span className="text-[10px] text-slate-400">Supported format: n8n v1 JSON</span>
                  </div>
                )}
              </div>
              {fileError && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}
            </div>

            {/* Status Feedback */}
            {summary && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  tone === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : tone === "warn"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {tone === "ok" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : tone === "warn" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{summary}</span>
                </div>

                {results && results.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-current/10 space-y-1.5">
                    {results.map((r, i) => (
                      <div key={i} className="flex items-center justify-between font-mono text-[11px]">
                        <span>{r.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            r.action === "created"
                              ? "bg-emerald-200/50 text-emerald-900"
                              : r.action === "exists"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-rose-200 text-rose-900"
                          }`}
                        >
                          {r.action}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={runImport}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-blue,#1565C0)] text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing…</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Run Sync Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
