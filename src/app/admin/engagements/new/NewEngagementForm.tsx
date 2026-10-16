"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminBackLink } from "@/app/admin/components/AdminBackLink";
import {
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Layers,
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Sparkles,
  Share2,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  CreditCard,
  Lock,
} from "lucide-react";
import { ClientEngagement } from "@/lib/engagements/types";
import { generatePortalEmailCopyText, generatePortalWhatsAppText } from "@/lib/engagements/share";

export default function NewEngagementForm() {
  const router = useRouter();

  // Form inputs
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState(
    "Enterprise Digital Platform & Cloud Architecture"
  );
  const [budgetRange, setBudgetRange] = useState("₹15,00,000 - ₹25,00,000");
  const [notes, setNotes] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [createdResult, setCreatedResult] = useState<{
    engagement: ClientEngagement;
    portalUrl: string;
    workspaceUrl: string;
    emailDispatched: boolean;
    emailMessage?: string;
  } | null>(null);

  // Clipboard copy states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWorkspaceLink, setCopiedWorkspaceLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Email resend state
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailStatusNote, setEmailStatusNote] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError("Please complete all required fields: Company Name, Contact Name, and Contact Email.");
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
          customMessage: customMessage.trim() || null,
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
      setEmailStatusNote(data.emailMessage || null);
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

  const handleCopyWorkspaceLink = () => {
    if (!createdResult?.workspaceUrl) return;
    navigator.clipboard.writeText(createdResult.workspaceUrl);
    setCopiedWorkspaceLink(true);
    setTimeout(() => setCopiedWorkspaceLink(false), 2500);
  };

  const handleCopyEmailText = () => {
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

  const handleResendEmail = async () => {
    if (!createdResult?.engagement?.engagement_ref) return;
    setResendingEmail(true);
    setEmailStatusNote(null);

    try {
      const res = await fetch(`/api/engagements/${createdResult.engagement.engagement_ref}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customMessage }),
      });
      const data = await res.json();
      if (data.ok) {
        setEmailStatusNote(`Invitation email successfully sent to ${createdResult.engagement.contact_email}`);
      } else {
        setEmailStatusNote(`Failed to send email: ${data.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger email";
      setEmailStatusNote(msg);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleResetForm = () => {
    setCompanyName("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setProjectTitle("Enterprise Digital Platform & Cloud Architecture");
    setBudgetRange("₹15,00,000 - ₹25,00,000");
    setNotes("");
    setCustomMessage("");
    setSendEmailImmediately(true);
    setCreatedResult(null);
    setError(null);
    setEmailStatusNote(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header & Breadcrumb */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <AdminBackLink href="/admin/engagements" label="Engagements Directory" />
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Layers className="w-3 h-3" />
            13-Stage Lifecycle
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Super Admin Gate
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
          Create Client Lifecycle Portal &amp; Engagement
        </h1>
        <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
          Initialize a complete 13-stage engagement portal, seed milestone prerequisite gates, link standard master templates, and dispatch the invitation access email.
        </p>
      </div>

      {/* Success View */}
      {createdResult ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-emerald-700">
                  Client Portal Successfully Provisioned
                </span>
                <h2 className="text-xl font-extrabold text-[var(--lit-navy,#0B2545)]">
                  {createdResult.engagement.company_name}
                </h2>
              </div>
            </div>

            <span className="font-mono text-sm font-bold bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF] px-3 py-1 rounded-xl">
              {createdResult.engagement.engagement_ref}
            </span>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs">
            <div>
              <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">Primary Contact:</span>
              <span className="font-bold text-[var(--lit-navy,#0B2545)]">{createdResult.engagement.contact_name}</span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">Contact Email:</span>
              <span className="font-bold text-[var(--lit-navy,#0B2545)]">{createdResult.engagement.contact_email}</span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">Milestone Governance:</span>
              <span className="font-bold text-emerald-700">13 Canonical Stages Active</span>
            </div>
          </div>

          {/* Link 1: 13-Stage Milestone Portal */}
          <div className="p-4 rounded-2xl bg-white border border-[#B9DCFF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#1565C0] uppercase tracking-wider block">
                1. 13-Stage Engagement Milestone Portal (Private Client Link)
              </span>
              <Link
                href={createdResult.portalUrl}
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1565C0] hover:underline"
              >
                <span>Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdResult.portalUrl}
                className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--lit-navy,#0B2545)] select-all"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied!" : "Copy Portal Link"}</span>
              </button>
            </div>
          </div>

          {/* Link 2: Client Portal Workspace */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                2. Client Portal Workspace (Enterprise Dashboard &amp; Team Workspace)
              </span>
              <Link
                href={createdResult.workspaceUrl}
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
              >
                <span>Open Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdResult.workspaceUrl}
                className="w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2 text-xs font-mono text-emerald-900 select-all"
              />
              <button
                onClick={handleCopyWorkspaceLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {copiedWorkspaceLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWorkspaceLink ? "Copied!" : "Copy Workspace Link"}</span>
              </button>
            </div>
          </div>

          {/* Email Dispatch Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#1565C0]" />
                <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                  Automatic Invitation Email Dispatch
                </span>
              </div>
              <button
                onClick={handleResendEmail}
                disabled={resendingEmail}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1565C0] hover:underline disabled:opacity-50"
              >
                {resendingEmail ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>Resend Email</span>
              </button>
            </div>

            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              {emailStatusNote || (createdResult.emailDispatched
                ? `Official LIT Email v2 invitation was dispatched to ${createdResult.engagement.contact_email}.`
                : "Automatic dispatch was not triggered. You can send it now or copy the formatted text below.")}
            </p>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCopyEmailText}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold text-[var(--lit-navy,#0B2545)] transition-all shadow-2xs cursor-pointer"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Mail className="w-4 h-4 text-[#1565C0]" />}
              <span>{copiedEmail ? "Email Copied!" : "Copy Email Draft (Dual Links)"}</span>
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold text-[var(--lit-navy,#0B2545)] transition-all shadow-2xs cursor-pointer"
            >
              {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-emerald-600" />}
              <span>{copiedWhatsApp ? "WhatsApp Text Copied!" : "Copy WhatsApp Message"}</span>
            </button>

            <Link
              href={createdResult.workspaceUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Launch Workspace</span>
              <ExternalLink className="w-4 h-4" />
            </Link>

            <Link
              href={createdResult.portalUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#0B2545] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Open 13-Stage Portal</span>
              <ExternalLink className="w-4 h-4" />
            </Link>

            <button
              onClick={handleResetForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all ml-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Another Portal</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Client Organization & Contact */}
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[var(--lit-navy,#0B2545)] font-bold text-sm border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-[#1565C0]" />
              <span>Client Organization &amp; Primary Stakeholder</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                  Organization / Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Meridian Technologies Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                  Primary Contact Person <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Krishnan"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                  Contact Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.krishnan@apexmeridian.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
                <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-1 block">
                  The client portal invitation link and milestone updates will be sent to this email.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                  Contact Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98401 23456"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
                <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-1 block">
                  For WhatsApp milestone dispatch and instant coordination.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Project Scope & Commercial Baseline */}
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[var(--lit-navy,#0B2545)] font-bold text-sm border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-[#1565C0]" />
              <span>Project Scope &amp; Commercial Baseline</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                  Project Title / Engagement Scope
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Enterprise Multi-Tenant AI Platform & Hospital Infrastructure"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                    Estimated SOW / Budget Range
                  </label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g. ₹15,00,000 - ₹25,00,000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                    Internal Notes &amp; Scoping Context
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Client requested initial kickoff before Q4 2026."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Invitation Email & Notification Preferences */}
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[var(--lit-navy,#0B2545)] font-bold text-sm border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-[#1565C0]" />
              <span>Invitation Email &amp; Automatic Notification</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                  Custom Personal Message for Client (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Thank you for connecting with us today. Please find your dedicated 13-stage lifecycle portal below where you can review technical requirements and proceed with milestone execution."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                <input
                  type="checkbox"
                  id="sendEmailImmediately"
                  checked={sendEmailImmediately}
                  onChange={(e) => setSendEmailImmediately(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1565C0] focus:ring-[#1565C0] border-slate-300"
                />
                <label htmlFor="sendEmailImmediately" className="text-xs text-[var(--lit-navy,#0B2545)] font-semibold cursor-pointer select-none">
                  Automatically dispatch LIT Email v2 portal invitation to <span className="font-mono text-[#1565C0]">{contactEmail || "client"}</span> immediately upon creation.
                </label>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/admin/engagements"
              className="text-xs font-bold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
            >
              Cancel &amp; Return
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Portal &amp; Sending Email...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Create Engagement &amp; Issue Portal</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
