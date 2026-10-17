"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminBackLink } from "@/app/admin/components/AdminBackLink";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import { StaffRole, StaffWorkspaceCreatedResult } from "@/lib/workspaces/types";

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
  const router = useRouter();

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
          employeeCode: employeeCode.trim() || undefined,
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
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        <AdminBackLink href="/admin/workspaces" label="Back to Staff Workspaces" />

        {/* Success Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-5">
            <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2 flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Workspace Provisioned Successfully
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {createdResult.employee.fullName}&apos;s Admin Workspace is Ready
              </h1>
              <p className="text-sm text-neutral-300">
                The private staff workspace has been created with assigned role{" "}
                <span className="font-semibold text-emerald-400">{createdResult.employee.jobTitle}</span> ({createdResult.employee.department}).
              </p>
            </div>
          </div>

          {/* Invitation Status Card */}
          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-400">Invitation Email Outbox Status</p>
                <p className="text-sm font-semibold text-white">
                  Sent to <span className="text-emerald-400">{createdResult.employee.email}</span>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700">
              Status: <strong className="text-white capitalize">{createdResult.invitationStatus}</strong>
            </span>
          </div>

          {/* Important Security Notice */}
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              <strong>Founder Credentials Notice:</strong> The temporary password was configured directly in Supabase Auth. For security, it was <em>never</em> sent via email or saved in plain text in the database. Please communicate the temporary password to {createdResult.employee.fullName} through your secure internal channel (e.g., in person or encrypted SMS).
            </div>
          </div>
        </div>

        {/* Copyable Links & UUID */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" /> Workspace Credentials & Routing Links
          </h2>

          <div className="space-y-4">
            {/* Direct Workspace Link */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Direct Staff Workspace URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={wsUrl}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(wsUrl, "ws")}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedWsLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedWsLink ? "Copied" : "Copy URL"}
                </button>
              </div>
            </div>

            {/* Direct Login Redirect Link */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Login Redirect Link (Sends Employee Directly to Workspace After Login)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={loginUrl}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(loginUrl, "login")}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  {copiedLoginLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLoginLink ? "Copied" : "Copy Login Link"}
                </button>
              </div>
            </div>

            {/* Workspace UUID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Unique Workspace UUID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdResult.workspaceId}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-300 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(createdResult.workspaceId, "uuid")}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  {copiedUuid ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedUuid ? "Copied" : "Copy UUID"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/workspaces/${createdResult.workspaceId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-all shadow-md"
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
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-5 py-3 text-sm font-semibold text-neutral-200 border border-white/10 transition-all"
            >
              <span>+ Create Another Workspace</span>
            </button>

            <Link
              href="/admin/workspaces"
              className="inline-flex items-center gap-2 rounded-xl bg-transparent hover:bg-white/5 px-4 py-3 text-sm font-semibold text-neutral-400 hover:text-white transition-all"
            >
              <span>Return to Workspaces Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <AdminBackLink href="/admin/workspaces" label="Back to Staff Workspaces" />

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
          <Shield className="w-4 h-4" /> Super Admin Provisioning Console
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Provision Individual Staff Admin Workspace
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Create a private, person-specific employee admin workspace. Provisions a unique Supabase Auth identity, assigns role capabilities, records an immutable audit trail, and delivers the workspace link without transmitting the password.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      <form onSubmit={handleOpenReview} className="space-y-8">
        {/* SECTION 1: EMPLOYEE IDENTITY */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> 1. Employee Identity & Corporate Profile
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter official employee credentials. Email must be the corporate identity used for workspace notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Full Legal Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Official Corporate Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="employee@logicintelligencetechnologies.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Phone Number (E.164) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Mobile Phone (E.164 Format) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Must start with country code, e.g. +91 for India</p>
            </div>

            {/* Employee Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Employee Code / Internal ID (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. LIT-ENG-042"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Department <span className="text-red-400">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="bg-neutral-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Working Role / Job Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Employment Type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                Employment Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "full_time", label: "Full-Time Staff" },
                  { id: "contractor", label: "Contractor" },
                  { id: "intern", label: "Intern" },
                  { id: "part_time", label: "Part-Time" },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      employmentType === type.id
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-black/30 border-white/5 text-neutral-400 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="employmentType"
                      value={type.id}
                      checked={employmentType === type.id}
                      onChange={() => setEmploymentType(type.id as any)}
                      className="sr-only"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FOUNDER-SUPPLIED TEMPORARY PASSWORD */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" /> 2. Temporary Initial Credentials
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Founder sets the initial password directly in Supabase Auth. Rotation is required upon first login.
              </p>
            </div>
            <button
              type="button"
              onClick={generateSecurePassword}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-white/10 transition-colors self-start sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Generate Secure Password
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Temporary Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Temporary Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 12 chars (A-Z, a-z, 0-9, symbol)"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Confirm Temporary Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat temporary password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div className="rounded-xl bg-black/30 p-4 border border-white/5 space-y-2">
            <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Security Criteria:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <span className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-400" : "text-neutral-500"}`}>
                {hasLength ? <Check className="w-3.5 h-3.5" /> : "•"} At least 12 characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-400" : "text-neutral-500"}`}>
                {hasUpper ? <Check className="w-3.5 h-3.5" /> : "•"} Uppercase letter (A-Z)
              </span>
              <span className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-400" : "text-neutral-500"}`}>
                {hasLower ? <Check className="w-3.5 h-3.5" /> : "•"} Lowercase letter (a-z)
              </span>
              <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400" : "text-neutral-500"}`}>
                {hasNumber ? <Check className="w-3.5 h-3.5" /> : "•"} Number (0-9)
              </span>
              <span className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-400" : "text-neutral-500"}`}>
                {hasSymbol ? <Check className="w-3.5 h-3.5" /> : "•"} Special symbol (!@#$)
              </span>
              <span className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-400" : "text-neutral-500"}`}>
                {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : "•"} Passwords match
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3.5 text-xs text-amber-300/90 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Knowledge Email Guarantee:</strong> This password will NOT be included in the emailed invitation. Deliver it separately to the employee via secure out-of-band communication.
            </span>
          </div>
        </div>

        {/* SECTION 3: SYSTEM ROLE & MODULE CAPABILITIES */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" /> 3. System Role & Module Permissions
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Select the employee&apos;s system baseline role and explicit operational capabilities.
            </p>
          </div>

          {/* System Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              System Baseline Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "developer", title: "Developer", desc: "Technical delivery, tasks, blueprints, and system health" },
                { id: "support", title: "Support", desc: "Assigned customer tickets, troubleshooting, and client comms" },
                { id: "operations", title: "Operations", desc: "Operational management, automation monitoring, intake" },
                { id: "admin", title: "Admin", desc: "General administrative review (Strictly non-Super Admin)" },
                { id: "viewer", title: "Viewer", desc: "Read-only access to assigned projects and tasks" },
              ].map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSystemRole(role.id as StaffRole)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    systemRole === role.id
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-black/30 border-white/5 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <p className="text-sm font-bold text-white">{role.title}</p>
                  <p className="text-xs text-neutral-400 mt-1">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Module Capabilities Checkboxes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
              Authorized Module Capabilities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => {
                const checked = allowedModules.includes(mod.id);
                return (
                  <label
                    key={mod.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "bg-teal-950/20 border-teal-500/40 text-white"
                        : "bg-black/20 border-white/5 text-neutral-400 hover:border-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModule(mod.id)}
                      className="mt-0.5 rounded border-white/20 bg-neutral-800 text-teal-500 focus:ring-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">{mod.label}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{mod.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: CLIENT ENGAGEMENT ASSIGNMENTS */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" /> 4. Client Engagement Assignments
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Assign this staff member to specific active client engagements. Financial information remains strictly redacted.
            </p>
          </div>

          {engagements.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-black/20 p-6 text-center text-xs text-neutral-400">
              No active client engagements currently registered. Assignments can also be configured later.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {engagements.map((eng) => {
                const selected = selectedEngagements.includes(eng.id);
                return (
                  <label
                    key={eng.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selected
                        ? "bg-indigo-950/20 border-indigo-500/40 text-white"
                        : "bg-black/20 border-white/5 text-neutral-400 hover:border-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleEngagement(eng.id)}
                      className="mt-0.5 rounded border-white/20 bg-neutral-800 text-indigo-500 focus:ring-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{eng.companyName}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{eng.projectTitle}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/workspaces"
            className="px-5 py-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all"
          >
            <span>Review & Provision Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* REVIEW CONFIRMATION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Confirm Staff Workspace Provisioning
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-neutral-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Employee Name:</span>
                <span className="font-semibold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Official Email:</span>
                <span className="font-mono text-white">{email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Phone Number:</span>
                <span className="font-mono text-white">{phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Department:</span>
                <span className="font-semibold text-white">{department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Job Title:</span>
                <span className="font-semibold text-blue-400">{jobTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">System Role:</span>
                <span className="font-semibold uppercase tracking-wider text-emerald-400">{systemRole}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Authorized Modules:</span>
                <span className="font-semibold text-white">{allowedModules.length} modules granted</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Client Assignments:</span>
                <span className="font-semibold text-white">{selectedEngagements.length} engagements</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Temporary Password:</span>
                <span className="font-mono text-neutral-400">•••••••••••• (masked for security)</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 text-xs text-blue-300 leading-relaxed">
              Upon clicking confirm, the Supabase Auth identity will be created, the private workspace UUID will be registered, and an invitation email will be queued for delivery to {email}.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-md"
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
