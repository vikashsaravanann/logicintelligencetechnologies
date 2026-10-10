"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, CheckCircle2, Loader2, LogIn, UserPlus, Mail } from "lucide-react";
import { PdfResource } from "@/config/pdfs";
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
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white tracking-tight">Your resource is ready</h3>
        <p className="mb-6 text-xs leading-relaxed text-slate-400">
          The download should start automatically. A secure copy was also queued for{" "}
          <strong className="text-white">{viewer?.email ?? "your email"}</strong>.
        </p>
        <a
          href={downloadUrl}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 px-7 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(69,217,210,0.35)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Download PDF Now
        </a>
      </div>
    );
  }

  if (!viewer) {
    const next = encodeURIComponent(`/resources/${resource.slug}`);
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-slate-300">
          Sign in or create a verified account to download this technical document. We deliver high-fidelity whitepapers and architectures directly to your inbox.
        </p>
        <Link
          href={`/login?next=${next}`}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(69,217,210,0.3)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Sign In to Access
        </Link>
        <Link
          href={`/login?mode=signup&next=${next}`}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-cyan-500/40 hover:bg-white/[0.08] active:scale-[0.98]"
        >
          <UserPlus className="h-4 w-4 text-cyan-400" aria-hidden />
          Create Free Account
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="flex items-center gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3.5 py-2.5 text-xs text-slate-300">
          <Mail className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
          <span className="min-w-0 break-all">Delivering to <strong className="text-white font-semibold">{viewer.email}</strong></span>
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300" role="alert">
          {error}
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="res-name">
          Full name <span className="text-cyan-400">*</span>
        </label>
        <input
          id="res-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#10131A] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:bg-[#151922] focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
          placeholder="Alex Morgan"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="res-company">
          Company / organization
        </label>
        <input
          id="res-company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#10131A] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:bg-[#151922] focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
          placeholder="Acme Enterprise"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-400 select-none">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5 rounded border-white/20 bg-[#10131A] text-cyan-500 focus:ring-cyan-400"
        />
        <span className="leading-relaxed">
          I&apos;d like to receive technical architecture updates and AI research from Logic Intelligence Technologies.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 py-3.5 text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(69,217,210,0.35)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Securing Resource…</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Email & Download PDF</span>
          </>
        )}
      </button>

      <p className="text-center text-[10px] leading-relaxed text-slate-500">
        Logic Intelligence Technologies strictly protects confidential communications. We never share or sell personal information.
      </p>
    </form>
  );
}
