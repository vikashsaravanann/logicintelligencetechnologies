"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminBackLink } from "@/app/admin/components/AdminBackLink";
import {
  User,
  Mail,
  Briefcase,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";
import { StaffRole, StaffWorkspaceCreatedResult } from "@/lib/workspaces/types";
import AssignProjectsModal from "../components/AssignProjectsModal";

interface EngagementOption {
  id: string;
  companyName: string;
  projectTitle: string;
  status: string;
}

interface WorkspaceCreationFormProps {
  engagements: EngagementOption[];
}

const DEPARTMENTS = [
  "Engineering",
  "AI Research & Development",
  "Operations",
  "Customer Success & Support",
  "Product & Design",
  "Cybersecurity & Infrastructure",
  "Executive & Management",
];

const AVAILABLE_MODULES = [
  { id: "leads.read", label: "Leads & Intake Inquiries", desc: "View incoming client inquiries and intake metadata" },
  { id: "support.read", label: "Support Tickets & Helpdesk", desc: "Access support desk for assigned clients" },
  { id: "support.reply", label: "Support Ticket Responses", desc: "Send verified support responses to assigned clients" },
  { id: "quotation.technical_draft.create", label: "Technical Quote Scoping", desc: "Draft technical requirements without monetary pricing" },
  { id: "invoice.preparation.create", label: "Invoice Preparation Requests", desc: "Submit delivery milestone invoice requests" },
  { id: "documents.read", label: "Technical Documents Read", desc: "Access project blueprints and specifications" },
  { id: "documents.upload", label: "Technical Documents Upload", desc: "Upload delivery deliverables and architecture docs" },
  { id: "automations.read", label: "Automations & Health Monitoring", desc: "View system automation pipelines and sync status" },
  { id: "seo.read", label: "SEO & Analytics", desc: "View website analytics and search console status" },
];

export default function WorkspaceCreationForm({ engagements }: WorkspaceCreationFormProps) {

  // Employee Identity
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [department, setDepartment] = useState("Engineering");
  const [jobTitle, setJobTitle] = useState("");
  const [employmentType, setEmploymentType] = useState<"full_time" | "contractor" | "intern" | "part_time">("full_time");
  const [employeeCode, setEmployeeCode] = useState("");

  // Credentials
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // System Role & Modules
  const [systemRole, setSystemRole] = useState<StaffRole>("developer");
  const [allowedModules, setAllowedModules] = useState<string[]>([
    "documents.read",
    "automations.read",
  ]);

  // Client assignments
  const [selectedEngagements, setSelectedEngagements] = useState<string[]>([]);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [createdResult, setCreatedResult] = useState<StaffWorkspaceCreatedResult | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Clipboard states
  const [copiedWsLink, setCopiedWsLink] = useState(false);
  const [copiedLoginLink, setCopiedLoginLink] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);

  // Password generator
  const generateSecurePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+";
    let pwd = "";
    // Ensure at least 1 upper, 1 lower, 1 digit, 1 symbol
    pwd += "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)];
    pwd += "abcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 24)];
    pwd += "23456789"[Math.floor(Math.random() * 8)];
    pwd += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)];
    for (let i = 4; i < 16; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    // Shuffle
    const shuffled = pwd.split("").sort(() => 0.5 - Math.random()).join("");
    setTemporaryPassword(shuffled);
    setConfirmPassword(shuffled);
  };

  // Password validation checks
  const hasLength = temporaryPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(temporaryPassword);
  const hasLower = /[a-z]/.test(temporaryPassword);
  const hasNumber = /[0-9]/.test(temporaryPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(temporaryPassword);
  const passwordsMatch = temporaryPassword === confirmPassword && temporaryPassword.length > 0;
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSymbol && passwordsMatch;

  const toggleModule = (id: string) => {
    setAllowedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleEngagement = (id: string) => {
    setSelectedEngagements((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !jobTitle.trim() || !phone.trim()) {
      setError("Please fill in all required employee identity fields.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure the temporary password meets all security criteria (minimum 12 characters, uppercase, lowercase, number, symbol) and matches the confirmation.");
      return;
    }

    setShowReviewModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowReviewModal(false);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          department: department.trim(),
          jobTitle: jobTitle.trim(),
          employmentType,
          employeeCode: employeeCode.trim().toUpperCase(),
          temporaryPassword,
          confirmPassword,
          systemRole,
          allowedModules,
          clientAssignments: selectedEngagements,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to provision staff workspace.");
      }

      setCreatedResult(data);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during workspace creation.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "ws" | "login" | "uuid") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "ws") {
        setCopiedWsLink(true);
        setTimeout(() => setCopiedWsLink(false), 2000);
      } else if (type === "login") {
        setCopiedLoginLink(true);
        setTimeout(() => setCopiedLoginLink(false), 2000);
      } else {
        setCopiedUuid(true);
        setTimeout(() => setCopiedUuid(false), 2000);
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // SUCCESS STATE VIEW
  if (createdResult) {
    const wsUrl = createdResult.workspaceUrl;
    const loginUrl = `${window?.location?.origin || "https://www.logicintelligencetechnologies.in"}/login?next=${encodeURIComponent(`/admin/workspaces/${createdResult.workspaceId}`)}`;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <AdminBackLink href="/admin/workspaces" label="Staff Workspaces Directory" />

        {/* Success Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 shadow-2xs">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="rounded-2xl bg-emerald-100 p-3.5 border border-emerald-300 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Workspace Provisioned Successfully
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
                {createdResult.employee.fullName}&apos;s Admin Workspace is Ready
              </h1>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
                The private staff workspace has been created with assigned role{" "}
                <span className="font-bold text-[var(--lit-navy,#0B2545)]">{createdResult.employee.jobTitle}</span> ({createdResult.employee.department}).
              </p>
            </div>
          </div>

          {/* Invitation Status Card */}
          <div className="mt-6 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-teal,#1FA9A2)]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">Invitation Email Outbox Status</p>
                <p className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  Sent to <span className="text-[var(--lit-teal,#1FA9A2)]">{createdResult.employee.email}</span>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
              Status: <strong className="text-[var(--lit-navy,#0B2545)] capitalize">{createdResult.invitationStatus}</strong>
            </span>
          </div>

          {/* Important Security Notice */}
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 shadow-2xs">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Founder Credentials Notice:</strong> The temporary password was configured directly in Supabase Auth. For security, it was <em>never</em> sent via email or saved in plain text in the database. Please communicate the temporary password to {createdResult.employee.fullName} through your secure internal channel (e.g., in person or encrypted message).
            </div>
          </div>
        </div>

        {/* Copyable Links & UUID */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 space-y-6 shadow-2xs">
          <div className="border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--lit-blue,#1565C0)]" /> Workspace Credentials & Routing Links
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
              Direct entry routes for this staff member&apos;s isolated administrative workspace.
            </p>
          </div>

          <div className="space-y-4">
            {/* Direct Workspace Link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Direct Staff Workspace URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={wsUrl}
                  className="flex-1 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(wsUrl, "ws")}
                  className="px-4 py-2.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedWsLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWsLink ? "Copied" : "Copy URL"}</span>
                </button>
              </div>
            </div>

            {/* Direct Login Redirect Link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Login Redirect Link (Sends Employee Directly to Workspace After Login)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={loginUrl}
                  className="flex-1 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(loginUrl, "login")}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs cursor-pointer"
                >
                  {copiedLoginLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLoginLink ? "Copied" : "Copy Login Link"}</span>
                </button>
              </div>
            </div>

            {/* Workspace UUID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Unique Workspace UUID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdResult.workspaceId}
                  className="flex-1 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(createdResult.workspaceId, "uuid")}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs cursor-pointer"
                >
                  {copiedUuid ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUuid ? "Copied" : "Copy UUID"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/workspaces/${createdResult.workspaceId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs"
            >
              <span>Open Staff Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                setCreatedResult(null);
                setFullName("");
                setEmail("");
                setPhone("+91");
                setJobTitle("");
                setTemporaryPassword("");
                setConfirmPassword("");
                setSelectedEngagements([]);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)] transition-all shadow-2xs cursor-pointer"
            >
              <span>+ Create Another Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Assign Projects</span>
            </button>

            <Link
              href="/admin/workspaces"
              className="inline-flex items-center gap-2 rounded-xl bg-transparent hover:bg-slate-100 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-all"
            >
              <span>Return to Workspaces Directory</span>
            </Link>
          </div>
        </div>

        <AssignProjectsModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          workspaceId={createdResult.workspaceId}
          staffUserId={createdResult.employee.id}
          staffEmail={createdResult.employee.email}
          staffName={createdResult.employee.fullName}
        />
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <AdminBackLink href="/admin/workspaces" label="Staff Workspaces Directory" />
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Shield className="w-3 h-3" />
            Super Admin Provisioning Console
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
            Person-Specific Workspace
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
          Create Staff Workspace
        </h1>
        <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1 max-w-3xl leading-relaxed">
          Create a private, person-specific employee admin workspace. Provisions a unique Supabase Auth identity, assigns role capabilities, records an immutable audit trail, and delivers the workspace link without transmitting the password.
        </p>
      </div>

      {error && (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 shadow-2xs flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleOpenReview} className="space-y-6">
        {/* SECTION 1: EMPLOYEE IDENTITY */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
                <User className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                  1. Employee Identity & Corporate Profile
                </h2>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                  Enter official employee credentials. Email must be the corporate identity used for workspace notifications.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors shadow-2xs"
              />
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Official Corporate Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="employee@logicintelligencetechnologies.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors font-mono text-xs shadow-2xs"
              />
            </div>

            {/* Phone Number (E.164) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Mobile Phone (E.164 Format) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors font-mono text-xs shadow-2xs"
              />
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Must start with country code, e.g. +91 for India</p>
            </div>

            {/* Employee Code — required, persisted on staff_employees */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Employee Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={32}
                placeholder="e.g. LIT-ENG-001"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors font-mono shadow-2xs tracking-wide"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Official internal ID saved on the employee record (unique). Example: LIT-FND-001, LIT-DEV-002.
              </p>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors shadow-2xs cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="bg-white text-[var(--lit-ink,#121826)]">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Working Role / Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors shadow-2xs"
              />
            </div>

            {/* Employment Type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-2">
                Employment Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "full_time", label: "Full-Time Staff" },
                  { id: "contractor", label: "Contractor" },
                  { id: "intern", label: "Intern" },
                  { id: "part_time", label: "Part-Time" },
                ].map((type) => {
                  const isSelected = employmentType === type.id;
                  return (
                    <label
                      key={type.id}
                      className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                        isSelected
                          ? "bg-teal-50 border-2 border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)] font-bold"
                          : "bg-white border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="employmentType"
                        value={type.id}
                        checked={isSelected}
                        onChange={() => setEmploymentType(type.id as any)}
                        className="sr-only"
                      />
                      {type.label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FOUNDER-SUPPLIED TEMPORARY PASSWORD */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="border-b border-[var(--lit-border-light,#DFE7EF)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <KeyRound className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                  2. Temporary Initial Credentials
                </h2>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                  Founder sets the initial password directly in Supabase Auth. Rotation is required upon first login.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={generateSecurePassword}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold uppercase tracking-wider text-amber-800 border border-amber-200 transition-colors shadow-2xs self-start sm:self-center cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Generate Secure Password</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Temporary Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Temporary Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 12 chars (A-Z, a-z, 0-9, symbol)"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors font-mono text-xs shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-[var(--lit-navy,#0B2545)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Confirm Temporary Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat temporary password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-1 focus:ring-[var(--lit-teal,#1FA9A2)] transition-colors font-mono text-xs shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div className="rounded-xl bg-[var(--lit-cloud,#F7F9FC)] p-4 border border-[var(--lit-border-light,#DFE7EF)] space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Security Criteria:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <span className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                {hasLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : "•"} At least 12 characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : "•"} Uppercase letter (A-Z)
              </span>
              <span className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                {hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : "•"} Lowercase letter (a-z)
              </span>
              <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : "•"} Number (0-9)
              </span>
              <span className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                {hasSymbol ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : "•"} Special symbol (!@#$)
              </span>
              <span className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : "•"} Passwords match
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Knowledge Email Guarantee:</strong> This password will NOT be included in the emailed invitation. Deliver it separately to the employee via secure out-of-band communication.
            </span>
          </div>
        </div>

        {/* SECTION 3: SYSTEM ROLE & MODULE CAPABILITIES */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                3. System Role & Module Permissions
              </h2>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Select the employee&apos;s system baseline role and explicit operational capabilities.
              </p>
            </div>
          </div>

          {/* System Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-2">
              System Baseline Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "developer", title: "Developer", desc: "Technical delivery, tasks, blueprints, and system health" },
                { id: "support", title: "Support", desc: "Assigned customer tickets, troubleshooting, and client comms" },
                { id: "operations", title: "Operations", desc: "Operational management, automation monitoring, intake" },
                { id: "admin", title: "Admin", desc: "General administrative review (Strictly non-Super Admin)" },
                { id: "viewer", title: "Viewer", desc: "Read-only access to assigned projects and tasks" },
              ].map((role) => {
                const isSelected = systemRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSystemRole(role.id as StaffRole)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all shadow-2xs ${
                      isSelected
                        ? "bg-teal-50/70 border-2 border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)]"
                        : "bg-white border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-ink,#121826)] hover:border-slate-300 hover:bg-[var(--lit-cloud,#F7F9FC)]"
                    }`}
                  >
                    <p className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">{role.title}</p>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">{role.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Capabilities Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-3">
              Authorized Module Capabilities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => {
                const checked = allowedModules.includes(mod.id);
                return (
                  <label
                    key={mod.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all shadow-2xs ${
                      checked
                        ? "bg-teal-50/60 border-2 border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)]"
                        : "bg-white border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-ink,#121826)] hover:border-slate-300 hover:bg-[var(--lit-cloud,#F7F9FC)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModule(mod.id)}
                      className="mt-0.5 rounded border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-teal,#1FA9A2)] focus:ring-[var(--lit-teal,#1FA9A2)]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">{mod.label}</p>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">{mod.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: CLIENT ENGAGEMENT ASSIGNMENTS */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Briefcase className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                4. Client Engagement Assignments
              </h2>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Assign this staff member to specific active client engagements. Financial information remains strictly redacted.
              </p>
            </div>
          </div>

          {engagements.length === 0 ? (
            <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-6 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
              No active client engagements currently registered. Assignments can also be configured later.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {engagements.map((eng) => {
                const selected = selectedEngagements.includes(eng.id);
                return (
                  <label
                    key={eng.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all shadow-2xs ${
                      selected
                        ? "bg-blue-50/70 border-2 border-[var(--lit-blue,#1565C0)] text-[var(--lit-navy,#0B2545)]"
                        : "bg-white border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-ink,#121826)] hover:border-slate-300 hover:bg-[var(--lit-cloud,#F7F9FC)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleEngagement(eng.id)}
                      className="mt-0.5 rounded border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--lit-navy,#0B2545)] truncate">{eng.companyName}</p>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] truncate">{eng.projectTitle}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/workspaces"
            className="px-5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 disabled:opacity-50 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-2xs transition-all cursor-pointer"
          >
            <span>Review & Provision Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* REVIEW CONFIRMATION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" /> Confirm Staff Workspace Provisioning
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-[var(--lit-navy,#0B2545)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Employee Name:</span>
                <span className="font-bold text-[var(--lit-navy,#0B2545)]">{fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Official Email:</span>
                <span className="font-mono text-[var(--lit-navy,#0B2545)] font-semibold">{email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Phone Number:</span>
                <span className="font-mono text-[var(--lit-navy,#0B2545)] font-semibold">{phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Department:</span>
                <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Job Title:</span>
                <span className="font-bold text-[var(--lit-blue,#1565C0)]">{jobTitle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">System Role:</span>
                <span className="font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{systemRole}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Authorized Modules:</span>
                <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{allowedModules.length} modules granted</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Client Assignments:</span>
                <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{selectedEngagements.length} engagements</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Temporary Password:</span>
                <span className="font-mono text-slate-400">•••••••••••• (masked for security)</span>
              </div>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-xs text-teal-900 leading-relaxed">
              Upon clicking confirm, the Supabase Auth identity will be created, the private workspace UUID will be registered, and an invitation email will be queued for delivery to {email}.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors shadow-2xs"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm & Provision Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
