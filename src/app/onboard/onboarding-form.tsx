"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { submitOnboarding, type SubmitResult } from "./actions";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-300";

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
      <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
        <p className="text-lg font-bold text-white">{result.message}</p>
        <p className="mt-1 text-sm text-primary/80">You can close this page. Our team will be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-xs leading-relaxed">
          <strong>Never enter passwords, API keys, or other credentials here.</strong> We never collect secrets
          through this form. Access is handed over later through a secure channel.
        </p>
      </div>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <legend className="px-1 text-sm font-bold text-white">Company</legend>
        <div>
          <label className={label} htmlFor="legalName">Legal company name *</label>
          <input id="legalName" name="legalName" required maxLength={200} className={input} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="displayName">Display name</label>
            <input id="displayName" name="displayName" maxLength={200} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="industry">Industry</label>
            <input id="industry" name="industry" maxLength={200} className={input} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="website">Website (https)</label>
          <input id="website" name="website" type="url" placeholder="https://example.com" className={input} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <legend className="px-1 text-sm font-bold text-white">Primary contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="contactName">Name *</label>
            <input id="contactName" name="contactName" required maxLength={200} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="contactEmail">Email *</label>
            <input id="contactEmail" name="contactEmail" type="email" required maxLength={200} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="phone">Phone</label>
            <input id="phone" name="phone" maxLength={200} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="role">Role</label>
            <input id="role" name="role" maxLength={200} className={input} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <legend className="px-1 text-sm font-bold text-white">Project</legend>
        <div>
          <label className={label} htmlFor="goals">Goals</label>
          <textarea id="goals" name="goals" rows={3} maxLength={4000} className={input} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="existingUrls">Existing URLs (one https URL per line)</label>
            <textarea id="existingUrls" name="existingUrls" rows={3} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="repositories">Repositories (one https URL per line)</label>
            <textarea id="repositories" name="repositories" rows={3} className={input} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <legend className="px-1 text-sm font-bold text-white">Access (no credentials)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="hostingProvider">Hosting provider</label>
            <input id="hostingProvider" name="hostingProvider" maxLength={200} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="domainRegistrar">Domain registrar</label>
            <input id="domainRegistrar" name="domainRegistrar" maxLength={200} className={input} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="accessNotes">Notes</label>
          <textarea id="accessNotes" name="accessNotes" rows={2} maxLength={4000} className={input} />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <legend className="px-1 text-sm font-bold text-white">Confirmation</legend>
        <label className="flex items-start gap-2.5 text-xs text-zinc-300">
          <input type="checkbox" name="noSecrets" required className="mt-0.5" />
          <span>I confirm I have not entered any passwords, API keys, or other credentials in this form.</span>
        </label>
        <label className="flex items-start gap-2.5 text-xs text-zinc-300">
          <input type="checkbox" name="authorized" required className="mt-0.5" />
          <span>I am authorized to provide this information on behalf of the company.</span>
        </label>
      </fieldset>

      {result && !result.ok ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300" role="alert">
          {result.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Submitting…" : "Submit onboarding"}
      </button>
    </form>
  );
}
