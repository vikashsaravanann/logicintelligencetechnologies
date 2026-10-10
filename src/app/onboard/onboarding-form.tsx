"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Building2,
  UserCheck,
  Layers,
  Server,
  Clock,
  ShieldCheck,
  Send,
  ArrowRight,
} from "lucide-react";
import { submitOnboarding, type SubmitResult } from "./actions";

const input =
  "w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/40 px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:bg-white focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 focus:outline-none transition-all shadow-2xs";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] font-mono";
const helper = "mt-1.5 text-[11px] text-[var(--lit-text-muted,#52677C)] leading-normal";

function lines(v: string): string[] {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function OnboardingForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const f = new FormData(e.currentTarget);
    const intake = {
      company: {
        legalName: String(f.get("legalName") || ""),
        displayName: String(f.get("displayName") || "") || undefined,
        website: String(f.get("website") || "") || undefined,
        industry: String(f.get("industry") || "") || undefined,
      },
      contact: {
        name: String(f.get("contactName") || ""),
        email: String(f.get("contactEmail") || ""),
        phone: String(f.get("phone") || "") || undefined,
        role: String(f.get("role") || "") || undefined,
      },
      project: {
        goals: String(f.get("goals") || "") || undefined,
        existingUrls: lines(String(f.get("existingUrls") || "")),
        repositories: lines(String(f.get("repositories") || "")),
      },
      access: {
        notes: String(f.get("accessNotes") || "") || undefined,
        hostingProvider: String(f.get("hostingProvider") || "") || undefined,
        domainRegistrar: String(f.get("domainRegistrar") || "") || undefined,
      },
      preferences: {
        timezone: String(f.get("timezone") || "") || undefined,
        communication: String(f.get("communication") || "") || undefined,
      },
      confirmation: {
        noSecretsConfirmed: f.get("noSecrets") === "on",
        authorized: f.get("authorized") === "on",
      },
    };
    // Drop empty arrays so the optional fields validate cleanly.
    if (intake.project.existingUrls.length === 0) delete (intake.project as { existingUrls?: string[] }).existingUrls;
    if (intake.project.repositories.length === 0) delete (intake.project as { repositories?: string[] }).repositories;

    // Drop preferences if both are empty
    if (!intake.preferences.timezone && !intake.preferences.communication) {
      delete (intake as { preferences?: unknown }).preferences;
    }

    try {
      setResult(await submitOnboarding(token, intake));
    } catch {
      setResult({ ok: false, message: "Something went wrong. Please try again shortly." });
    } finally {
      setLoading(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="rounded-3xl border border-teal-200 bg-white p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 shadow-2xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
          Onboarding Submission Received
        </h2>
        <p className="mt-2 text-sm text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto leading-relaxed">
          {result.message}
        </p>
        <div className="mt-6 p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] max-w-md mx-auto text-left text-xs text-[var(--lit-text-muted,#52677C)] space-y-1.5">
          <p className="font-semibold text-[var(--lit-navy,#0B2545)]">What happens next?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Our engineering leads review your requirements and architecture scope.</li>
            <li>We provision your project sandbox and configure secure channels.</li>
            <li>You will receive your kickoff confirmation within 1 business day.</li>
          </ul>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all"
          >
            <span>Return to Homepage</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Zero Credential Warning */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-amber-900 shadow-2xs">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-amber-950">Zero-Credential Policy</p>
          <p className="mt-0.5 text-amber-900/90">
            <strong>Never enter passwords, API keys, private keys, or credentials here.</strong> We never collect secrets
            through this intake form. Production credentials and access delegations are coordinated later via our encrypted key exchange.
          </p>
        </div>
      </div>

      {/* Section 1: Company Information */}
      <fieldset className="rounded-2xl sm:rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
            <Building2 className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div>
            <legend className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              1. Organization & Identity
            </legend>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Official company registration and business presence.
            </p>
          </div>
        </div>

        <div>
          <label className={label} htmlFor="legalName">
            Legal Entity Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="legalName"
            name="legalName"
            required
            maxLength={200}
            placeholder="Acme Technologies Private Limited"
            className={input}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="displayName">
              Brand / Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              maxLength={200}
              placeholder="Acme"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="industry">
              Industry Sector
            </label>
            <input
              id="industry"
              name="industry"
              maxLength={200}
              placeholder="Healthcare, AI, SaaS, FinTech"
              className={input}
            />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="website">
            Corporate Website (HTTPS)
          </label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://example.com"
            className={input}
          />
          <p className={helper}>Must begin with https://</p>
        </div>
      </fieldset>

      {/* Section 2: Primary Contact */}
      <fieldset className="rounded-2xl sm:rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
            <UserCheck className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div>
            <legend className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              2. Primary Project Lead
            </legend>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Authorized stakeholder for delivery sign-offs and technical coordination.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="contactName">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="contactName"
              name="contactName"
              required
              maxLength={200}
              placeholder="Dr. Eleanor Vance"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="contactEmail">
              Corporate Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              maxLength={200}
              placeholder="eleanor@example.com"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="phone">
              Direct Phone / Mobile
            </label>
            <input
              id="phone"
              name="phone"
              maxLength={200}
              placeholder="+1 (555) 000-0000"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="role">
              Organizational Role
            </label>
            <input
              id="role"
              name="role"
              maxLength={200}
              placeholder="Chief Technology Officer"
              className={input}
            />
          </div>
        </div>
      </fieldset>

      {/* Section 3: Project Architecture */}
      <fieldset className="rounded-2xl sm:rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
            <Layers className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div>
            <legend className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              3. Project Scope & Architecture
            </legend>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Core outcomes, existing application URLs, and code repository links.
            </p>
          </div>
        </div>

        <div>
          <label className={label} htmlFor="goals">
            Core Objectives & Key Deliverables
          </label>
          <textarea
            id="goals"
            name="goals"
            rows={3}
            maxLength={4000}
            placeholder="Outline your primary goals, business requirements, target milestones, and key deliverables..."
            className={input}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="existingUrls">
              Existing Environments (HTTPS)
            </label>
            <textarea
              id="existingUrls"
              name="existingUrls"
              rows={3}
              placeholder="https://app.example.com&#10;https://staging.example.com"
              className={input}
            />
            <p className={helper}>One https URL per line</p>
          </div>
          <div>
            <label className={label} htmlFor="repositories">
              Code Repositories (HTTPS)
            </label>
            <textarea
              id="repositories"
              name="repositories"
              rows={3}
              placeholder="https://github.com/organization/repo&#10;https://gitlab.com/organization/core"
              className={input}
            />
            <p className={helper}>One https URL per line</p>
          </div>
        </div>
      </fieldset>

      {/* Section 4: Infrastructure & Access Overview */}
      <fieldset className="rounded-2xl sm:rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
            <Server className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div>
            <legend className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              4. Infrastructure & Access Overview
            </legend>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Hosting setup details (remember: zero passwords or access keys).
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="hostingProvider">
              Cloud / Hosting Provider
            </label>
            <input
              id="hostingProvider"
              name="hostingProvider"
              maxLength={200}
              placeholder="AWS, Google Cloud, Azure, Vercel"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="domainRegistrar">
              DNS / Domain Registrar
            </label>
            <input
              id="domainRegistrar"
              name="domainRegistrar"
              maxLength={200}
              placeholder="Cloudflare, Route53, GoDaddy"
              className={input}
            />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="accessNotes">
            Technical Architecture Notes
          </label>
          <textarea
            id="accessNotes"
            name="accessNotes"
            rows={2}
            maxLength={4000}
            placeholder="Special considerations, firewall policies, VPC configurations, or compliance requirements..."
            className={input}
          />
        </div>
      </fieldset>

      {/* Section 5: Preferences */}
      <fieldset className="rounded-2xl sm:rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
            <Clock className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div>
            <legend className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              5. Collaboration Preferences
            </legend>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Operational timezones and preferred sync mechanisms.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="timezone">
              Primary Timezone
            </label>
            <input
              id="timezone"
              name="timezone"
              maxLength={200}
              placeholder="Asia/Kolkata (IST), UTC, EST"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="communication">
              Preferred Channel
            </label>
            <input
              id="communication"
              name="communication"
              maxLength={200}
              placeholder="Slack Connect, MS Teams, Email"
              className={input}
            />
          </div>
        </div>
      </fieldset>

      {/* Section 6: Attestation & Confirmation */}
      <fieldset className="rounded-2xl sm:rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
            <ShieldCheck className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div>
            <legend className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              6. Attestation & Confirmation
            </legend>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Please review and verify before submitting.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] p-4 cursor-pointer hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors">
          <input
            type="checkbox"
            name="noSecrets"
            required
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--lit-navy,#0B2545)] focus:ring-[var(--lit-teal,#1FA9A2)]"
          />
          <span className="text-xs text-[var(--lit-ink,#121826)] leading-relaxed font-medium">
            I confirm I have <strong>not entered any passwords, API keys, private keys, or credentials</strong> in this form.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] p-4 cursor-pointer hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors">
          <input
            type="checkbox"
            name="authorized"
            required
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--lit-navy,#0B2545)] focus:ring-[var(--lit-teal,#1FA9A2)]"
          />
          <span className="text-xs text-[var(--lit-ink,#121826)] leading-relaxed font-medium">
            I am authorized to provide this organizational, architectural, and contact information on behalf of the client entity.
          </span>
        </label>
      </fieldset>

      {result && !result.ok ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <p className="leading-relaxed">{result.message}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-[var(--lit-text-muted,#52677C)] hidden sm:block">
          All submissions are processed under strict NDA.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--lit-navy,#0B2545)]/90 shadow-sm transition-all focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] focus:outline-none disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />}
          {loading ? "Submitting Details…" : "Submit Onboarding Intake"}
        </button>
      </div>
    </form>
  );
}
