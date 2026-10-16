"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  LayoutDashboard,
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
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState("Enterprise Digital Platform & Cloud Architecture");
  const [budgetRange, setBudgetRange] = useState("");
  const [notes, setNotes] = useState("");
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);

  // Created result
  const [createdResult, setCreatedResult] = useState<{
    engagement: ClientEngagement;
    portalUrl: string;
    workspaceUrl: string;
    emailDispatched: boolean;
    emailMessage?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWorkspace, setCopiedWorkspace] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

      const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const fallbackWorkspaceUrl = `${siteUrl}/client/login?ref=${data.engagement.engagement_ref}`;

      setCreatedResult({
        engagement: data.engagement,
        portalUrl: data.portalUrl,
        workspaceUrl: data.workspaceUrl || fallbackWorkspaceUrl,
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

  const handleCopyWorkspace = () => {
    if (!createdResult?.workspaceUrl) return;
    navigator.clipboard.writeText(createdResult.workspaceUrl);
    setCopiedWorkspace(true);
    setTimeout(() => setCopiedWorkspace(false), 2500);
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

  const modalContent = open ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[var(--lit-border-light,#DFE7EF)] my-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#E7F3FF] border border-[#B9DCFF] text-[var(--lit-blue,#1565C0)]">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-poppins font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                Create Client Lifecycle Portal &amp; Workspace
              </h3>
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                Initializes 13-stage milestone gates and connects isolated client workspace.
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
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs">
                    Portals Initialized: {createdResult.engagement.company_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-800">
                  <span>Engagement Ref:</span>
                  <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
                    {createdResult.engagement.engagement_ref}
                  </code>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {createdResult.emailDispatched
                    ? `Invitation email successfully dispatched to ${createdResult.engagement.contact_email}.`
                    : "Email invitation queued for manual or auto dispatch."}
                </p>
              </div>

              {/* Link 1: 13-Stage Engagement Milestone Portal */}
              <div className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[#B9DCFF] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1565C0] block">
                    1. 13-Stage Engagement Milestone Portal (Private Link)
                  </label>
                  <a
                    href={createdResult.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1565C0] hover:underline"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.portalUrl}
                    className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Link 2: Client Portal Workspace */}
              <div className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-emerald-700 block">
                    2. Client Portal Workspace (Enterprise Dashboard)
                  </label>
                  <a
                    href={createdResult.workspaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.workspaceUrl}
                    className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all"
                  />
                  <button
                    onClick={handleCopyWorkspace}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    {copiedWorkspace ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWorkspace ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Copy Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-all cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Mail className="w-4 h-4 text-[#1565C0]" />}
                  <span>{copiedEmail ? "Email Copied!" : "Copy Email Draft (Dual Links)"}</span>
                </button>

                <button
                  onClick={handleCopyWhatsApp}
                  className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-all cursor-pointer"
                >
                  {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-emerald-600" />}
                  <span>{copiedWhatsApp ? "WhatsApp Copied!" : "Copy WhatsApp Message"}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors cursor-pointer"
                >
                  Close &amp; Refresh
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={createdResult.workspaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Workspace</span>
                  </a>
                  <a
                    href={createdResult.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1565C0] hover:bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    <span>13-Stage Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
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
                        className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
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
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
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
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
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
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                          Total Contract Commitment / Base Rate (Excl. GST)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 50 or ₹50.00"
                          value={budgetRange}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-black font-semibold placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                          style={{ color: "#000000", WebkitTextFillColor: "#000000", backgroundColor: "#FFFFFF" }}
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
                        className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
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
                        className="w-full px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0] resize-none"
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
      ) : null;

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

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
