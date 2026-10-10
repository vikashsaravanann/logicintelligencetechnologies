"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, CheckCircle2, Loader2, LogIn, UserPlus, Mail, ShieldCheck } from "lucide-react";
import type { PdfResource } from "@/config/pdfs";
import { trackEvent } from "@/lib/analytics";

interface Props {
  resource: PdfResource;
  /** Signed-in visitor, or null. Resources are delivered to the account email. */
  viewer: { name: string; email: string } | null;
}

export default function ResourceDownloadForm({ resource, viewer }: Props) {
  const [name, setName] = useState(viewer?.name ?? "");
  const [company, setCompany] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/resources/${encodeURIComponent(resource.slug)}/request-access`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: name.trim(),
            company: company.trim() || undefined,
            marketingConsent,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(`/resources/${resource.slug}`)}`;
        return;
      }
      if (!res.ok || !data.success || !data.downloadUrl) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Unable to grant access. Please try again."
        );
      }

      trackEvent("resource_download", {
        resourceId: resource.id,
        resourceTitle: resource.title,
      });

      setDownloadUrl(data.downloadUrl as string);

      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (downloadUrl) {
    return (
      <div className="py-6 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight">
            Your resource is ready
          </h3>
          <p className="text-xs leading-relaxed text-[var(--lit-text-muted,#52677C)]">
            The download should start automatically. A secure copy was also queued for{" "}
            <strong className="text-[var(--lit-navy,#0B2545)] font-semibold">{viewer?.email ?? "your email"}</strong>.
          </p>
        </div>
        <div className="pt-2">
          <a
            href={downloadUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <Download className="h-4 w-4 text-cyan-300" />
            <span>Download PDF Again</span>
          </a>
        </div>
      </div>
    );
  }

  if (!viewer) {
    const next = encodeURIComponent(`/resources/${resource.slug}`);
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-text-muted,#52677C)] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
          <span>
            Sign in or create a verified account to access this technical document. We deliver authentic enterprise whitepapers directly to your corporate inbox.
          </span>
        </div>
        <Link
          href={`/login?next=${next}`}
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4 text-cyan-300" aria-hidden />
          <span>Sign In to Access</span>
        </Link>
        <Link
          href={`/login?mode=signup&next=${next}`}
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-slate-50 text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] hover:border-[#1565C0]/40 transition-all active:scale-[0.98]"
        >
          <UserPlus className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" aria-hidden />
          <span>Create Free Account</span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="flex items-center gap-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2.5 text-xs text-[var(--lit-text-muted,#52677C)]">
          <Mail className="h-4 w-4 shrink-0 text-[var(--lit-blue,#1565C0)]" aria-hidden />
          <span className="min-w-0 break-all">
            Delivering to <strong className="text-[var(--lit-navy,#0B2545)] font-semibold">{viewer.email}</strong>
          </span>
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700" role="alert">
          {error}
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]" htmlFor="res-name">
          Full Name <span className="text-[var(--lit-blue,#1565C0)]">*</span>
        </label>
        <input
          id="res-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/10 transition-all"
          placeholder="Alex Morgan"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]" htmlFor="res-company">
          Company / Organization
        </label>
        <input
          id="res-company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-4 py-2.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/10 transition-all"
          placeholder="Acme Enterprise"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[var(--lit-text-muted,#52677C)] select-none">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5 rounded border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)]"
        />
        <span className="leading-relaxed">
          I&apos;d like to receive technical architecture updates and AI research from Logic Intelligence Technologies.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            <span>Securing Resource…</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4 text-cyan-300" />
            <span>Email &amp; Download PDF</span>
          </>
        )}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-[var(--lit-text-muted,#52677C)]">
        Logic Intelligence Technologies strictly protects confidential communications. We never share or sell personal information.
      </p>
    </form>
  );
}
