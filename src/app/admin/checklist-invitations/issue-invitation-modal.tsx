"use client";

import { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  Send,
  X,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function IssueInvitationModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [ttlDays, setTtlDays] = useState(30);

  const [createdResult, setCreatedResult] = useState<{
    invitationId: string;
    url: string;
    expiresAt: string;
    emailDispatched?: boolean;
    recipientEmail?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientEmail.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/enterprise-checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          recipientCompany,
          notes,
          ttlDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create invitation.");
      }

      setCreatedResult({
        invitationId: data.invitationId,
        url: data.url,
        expiresAt: data.expiresAt,
        emailDispatched: data.emailDispatched ?? true,
        recipientEmail: recipientEmail.trim(),
      });
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdResult?.url) return;
    navigator.clipboard.writeText(createdResult.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setRecipientName("");
    setRecipientEmail("");
    setRecipientCompany("");
    setNotes("");
    setTtlDays(30);
    setCreatedResult(null);
    setError(null);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Issue Checklist Invitation</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-xl flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded-md bg-[#E7F3FF] border border-[#B9DCFF] text-[var(--lit-blue,#1565C0)]">
                  <KeyRound className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                    Issue 50-Point Enterprise Checklist Link
                  </h3>
                  <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                    Generates a cryptographically hashed, client-scoped invitation token.
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-xs space-y-4">
              {createdResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Invitation Link Generated & Email Dispatched</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {createdResult.emailDispatched
                        ? `The official 50-Point Enterprise Deployment Checklist invitation email has been sent automatically to ${createdResult.recipientEmail || "the recipient"}.`
                        : "The invitation link was created. Email delivery is being queued."}
                    </p>
                  </div>

                  <div>
                    <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                      Private Client Invitation URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={createdResult.url}
                        className="flex-1 p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-xs font-mono select-all"
                      />
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-semibold hover:bg-[#123663]"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/admin/checklist-invitations/${createdResult.invitationId}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--lit-navy,#0B2545)] hover:underline font-semibold"
                      >
                        <span>Open Admin Scope Detail →</span>
                      </a>
                      <a
                        href={createdResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--lit-blue,#1565C0)] hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Client Page</span>
                      </a>
                    </div>

                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold hover:bg-slate-50"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                        Recipient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="e.g. Alex Henderson"
                        className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
                      />
                    </div>

                    <div>
                      <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="alex@organization.com"
                        className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                        Company / Account Name
                      </label>
                      <input
                        type="text"
                        value={recipientCompany}
                        onChange={(e) => setRecipientCompany(e.target.value)}
                        placeholder="e.g. Nexus Financial Technologies"
                        className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
                      />
                    </div>

                    <div>
                      <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                        Token Validity (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={ttlDays}
                        onChange={(e) => setTtlDays(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                      Internal Notes (Staff Only)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Target project: Next.js migration, voice telephony agent..."
                      className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Token…</span>
                        </>
                      ) : (
                        <span>Generate Invitation</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
