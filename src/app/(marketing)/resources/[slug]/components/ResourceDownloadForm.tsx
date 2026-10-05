"use client";

import { useState } from "react";
import { Download, CheckCircle2, Loader2 } from "lucide-react";
import { PdfResource } from "@/config/pdfs";
import { trackEvent } from "@/lib/analytics";

interface Props {
  resource: PdfResource;
}

export default function ResourceDownloadForm({ resource }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
            email: email.trim(),
            company: company.trim() || undefined,
            marketingConsent,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
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
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">Your resource is ready</h3>
        <p className="mb-6 text-xs leading-relaxed text-zinc-400">
          The download should start automatically. A secure link was also sent to
          your email (expires shortly).
        </p>
        <a
          href={downloadUrl}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="mb-1 text-base font-bold text-white">Get the resource</h3>
        <p className="text-xs text-zinc-400">
          Enter your details to access this resource.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300" role="alert">
          {error}
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300" htmlFor="res-name">
          Full name *
        </label>
        <input
          id="res-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none"
          placeholder="Alex Morgan"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300" htmlFor="res-email">
          Work email *
        </label>
        <input
          id="res-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none"
          placeholder="alex@company.com"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300" htmlFor="res-company">
          Company / organization
        </label>
        <input
          id="res-company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none"
          placeholder="Acme Corp"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-400">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5 rounded border-white/20"
        />
        <span>
          I&apos;d like to receive occasional insights and updates from Logic
          Intelligence Technologies.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(0,191,255,0.3)] transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Granting access…</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Get the PDF</span>
          </>
        )}
      </button>

      <p className="text-center text-[10px] leading-relaxed text-zinc-500">
        We use your details to provide this resource and related service
        communications where applicable. Your information is not sold.
      </p>
    </form>
  );
}
