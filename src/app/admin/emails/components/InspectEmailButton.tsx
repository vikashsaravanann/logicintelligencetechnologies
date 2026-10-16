"use client";

import { useState } from "react";
import { Eye, X, Mail, Clock, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export interface InspectEmailData {
  id: string;
  recipient: string;
  sender?: string | null;
  replyTo?: string | null;
  subject: string;
  status: string;
  eventType?: string | null;
  templateKey?: string | null;
  html?: string | null;
  text?: string | null;
  sentAt?: string | null;
  createdAt?: string | null;
  providerMessageId?: string | null;
  lastError?: string | null;
  attemptCount?: number | null;
}

export function InspectEmailButton({ email }: { email: InspectEmailData }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "text" | "json">("html");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-blue,#1565C0)] hover:text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider transition-all shadow-2xs"
        title="Inspect Email Payload & Rendered Preview"
      >
        <Eye className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
        <span>Inspect</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Header */}
            <div className="p-5 sm:px-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between bg-[var(--lit-cloud,#F7F9FC)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] leading-tight">
                    {email.subject || "Email Inspection"}
                  </h3>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono mt-0.5">
                    To: {email.recipient}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                <span className="font-semibold text-slate-800 capitalize">{email.status}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Template / Event</span>
                <span className="font-mono text-[11px] text-slate-800">{email.templateKey || email.eventType || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Sender Pool</span>
                <span className="font-mono text-[11px] text-slate-800">{email.sender || "hello"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Dispatch Time</span>
                <span className="font-mono text-[11px] text-slate-800">
                  {email.sentAt ? new Date(email.sentAt).toLocaleString("en-IN") : "—"}
                </span>
              </div>
            </div>

            {/* Error banner if present */}
            {email.lastError && (
              <div className="p-3.5 mx-5 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 shrink-0">
                <strong className="block font-bold mb-0.5">Delivery Error:</strong>
                {email.lastError}
              </div>
            )}

            {/* Tab navigation */}
            <div className="px-6 pt-3 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between shrink-0">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("html")}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                    activeTab === "html"
                      ? "border-[var(--lit-blue,#1565C0)] text-[var(--lit-blue,#1565C0)]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  HTML Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                    activeTab === "text"
                      ? "border-[var(--lit-blue,#1565C0)] text-[var(--lit-blue,#1565C0)]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Plain Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                    activeTab === "json"
                      ? "border-[var(--lit-blue,#1565C0)] text-[var(--lit-blue,#1565C0)]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Raw Metadata
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activeTab === "html" ? email.html || "" : activeTab === "text" ? email.text || "" : JSON.stringify(email, null, 2))}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 pb-2"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Content"}</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 min-h-[300px]">
              {activeTab === "html" && (
                email.html ? (
                  <iframe
                    srcDoc={email.html}
                    title="Rendered Email Preview"
                    className="w-full h-[460px] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl bg-white"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    No HTML body was recorded for this dispatch.
                  </div>
                )
              )}

              {activeTab === "text" && (
                <pre className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                  {email.text || "No plain text content available."}
                </pre>
              )}

              {activeTab === "json" && (
                <pre className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                  {JSON.stringify(email, null, 2)}
                </pre>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between shrink-0 text-xs">
              <span className="font-mono text-slate-500 text-[11px]">
                ID: {email.id}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold uppercase tracking-wider text-xs hover:bg-[var(--lit-navy,#0B2545)]/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
