"use client";

import { useState } from "react";
import { Eye, X, Bot, Mail, Phone, Building, MessageSquare, Clock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { formatIST } from "@/lib/format/datetime";

export interface InspectAiLeadData {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  interest?: string | null;
  source?: string | null;
  chat_id?: string | null;
  created_at?: string | null;
}

export function InspectAiLeadButton({ lead }: { lead: InspectAiLeadData }) {
  const [open, setOpen] = useState(false);
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
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider transition-all shadow-2xs"
        title="Inspect AI Lead Details"
      >
        <Eye className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
        <span>Inspect</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Header */}
            <div className="p-5 sm:px-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between bg-[var(--lit-cloud,#F7F9FC)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] leading-tight">
                    {lead.name || "Anonymous Lead"}
                  </h3>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono mt-0.5">
                    Source: {lead.source || "AI Assistant"}
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

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50/70 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contact Email</span>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-[var(--lit-teal,#1FA9A2)] hover:underline inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phone / WhatsApp</span>
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-[var(--lit-navy,#0B2545)] hover:underline inline-flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company / Organization</span>
                <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.company || "Not Specified"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Captured Timestamp</span>
                <div className="text-xs font-mono text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.created_at ? formatIST(lead.created_at) : "—"}</span>
                </div>
              </div>
            </div>

            {/* Interest & Conversation Context */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
                    Inquired Requirement / AI Intent Notes
                  </span>
                  {lead.interest && (
                    <button
                      type="button"
                      onClick={() => handleCopy(lead.interest || "")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                <div className="p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                  {lead.interest || "No requirement notes recorded."}
                </div>
              </div>

              {lead.chat_id && (
                <div className="p-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Originating AI Chat Session</span>
                  <code className="text-[11px] font-mono text-[var(--lit-navy,#0B2545)] bg-slate-100 px-2 py-0.5 rounded">
                    {lead.chat_id}
                  </code>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between shrink-0 text-xs">
              <span className="font-mono text-slate-500 text-[11px]">
                ID: {lead.id}
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
