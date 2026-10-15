"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Building2,
  User,
  Mail,
  Phone,
  Layers,
  Sparkles,
  Share2,
} from "lucide-react";
import { ClientEngagement } from "@/lib/engagements/types";
import { generatePortalEmailCopyText, generatePortalWhatsAppText } from "@/lib/engagements/share";

interface IssueEngagementModalProps {
  buttonLabel?: string;
  buttonClassName?: string;
  onCreated?: (engagement: ClientEngagement) => void;
}

export function IssueEngagementModal({
  buttonLabel = "Create Client Portal",
  buttonClassName,
  onCreated,
}: IssueEngagementModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState("Enterprise Digital Platform & Cloud Architecture");
  const [budgetRange, setBudgetRange] = useState("₹15,00,000 - ₹25,00,000");
  const [notes, setNotes] = useState("");
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);

  // Created result
  const [createdResult, setCreatedResult] = useState<{
    engagement: ClientEngagement;
    portalUrl: string;
    emailDispatched: boolean;
    emailMessage?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError("Company Name, Contact Name, and Contact Email are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim().toLowerCase(),
          contactPhone: contactPhone.trim() || null,
          projectTitle: projectTitle.trim(),
          budgetRange: budgetRange.trim() || null,
          notes: notes.trim() || null,
          sendEmailImmediately,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create client engagement portal.");
      }

      setCreatedResult({
        engagement: data.engagement,
        portalUrl: data.portalUrl,
        emailDispatched: data.emailDispatched,
        emailMessage: data.emailMessage,
      });

      if (onCreated) {
        onCreated(data.engagement);
      }
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdResult?.portalUrl) return;
    navigator.clipboard.writeText(createdResult.portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmail = () => {
    if (!createdResult?.engagement) return;
    const text = generatePortalEmailCopyText(createdResult.engagement);
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyWhatsApp = () => {
    if (!createdResult?.engagement) return;
    const text = generatePortalWhatsAppText(createdResult.engagement);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleReset = () => {
    setCompanyName("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setProjectTitle("Enterprise Digital Platform & Cloud Architecture");
    setBudgetRange("₹15,00,000 - ₹25,00,000");
    setNotes("");
    setSendEmailImmediately(true);
    setCreatedResult(null);
    setError(null);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          buttonClassName ||
          "inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer"
        }
      >
        <Plus className="w-4 h-4" />
        <span>{buttonLabel}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[var(--lit-border-light,#DFE7EF)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded-md bg-[#E7F3FF] border border-[#B9DCFF] text-[var(--lit-blue,#1565C0)]">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                    Create Client Lifecycle Portal
                  </h3>
                  <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                    Initializes 13-stage milestone gates and automatically sends invitation email.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6">
              {createdResult ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs">
                        Portal Created: {createdResult.engagement.company_name}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Engagement Ref: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">{createdResult.engagement.engagement_ref}</code>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {createdResult.emailDispatched
                        ? `Invitation email successfully dispatched to ${createdResult.engagement.contact_email}.`
                        : "Email dispatch completed / queued."}
                    </p>
                  </div>

                  {/* URL */}
                  <div className="space-y-1.5">
                    <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                      Private Client Portal URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdResult.portalUrl}
                        className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 select-all"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shrink-0 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Copy Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleCopyEmail}
                      className="inline-flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Mail className="w-4 h-4 text-[#1565C0]" />}
                      <span>{copiedEmail ? "Email Copied!" : "Copy Email Draft"}</span>
                    </button>

                    <button
                      onClick={handleCopyWhatsApp}
                      className="inline-flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-emerald-600" />}
                      <span>{copiedWhatsApp ? "WhatsApp Copied!" : "WhatsApp"}</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                    <button
                      onClick={handleReset}
                      className="text-xs font-bold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors cursor-pointer"
                    >
                      Close &amp; Refresh
                    </button>
                    <a
                      href={createdResult.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold shadow-2xs transition-colors"
                    >
                      <span>Open Preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-4 text-xs">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                        Organization / Company Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Meridian Technologies Pvt Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                          Primary Contact Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Rajesh Krishnan"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                          Corporate Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. contact@company.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98401 23456"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                          Budget Range (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ₹15,00,000 - ₹25,00,000"
                          value={budgetRange}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                        Project Title / Scope
                      </label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                        Notes / Brief
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Preliminary client notes, architectural focus, or intake brief…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <input
                        type="checkbox"
                        id="modalSendEmail"
                        checked={sendEmailImmediately}
                        onChange={(e) => setSendEmailImmediately(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1565C0] focus:ring-[#1565C0] cursor-pointer"
                      />
                      <label htmlFor="modalSendEmail" className="text-[11px] text-slate-700 font-semibold cursor-pointer select-none">
                        Send portal access email automatically to corporate contact upon creation
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-black cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Create Portal</span>
                        </>
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
