"use client";

import { useState } from "react";
import { Download, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { PdfResource } from "@/config/pdfs";
import { trackEvent } from "@/lib/analytics";

interface Props {
  resource: PdfResource;
}

export default function ResourceDownloadForm({ resource }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Post lead data to contact / lead ingestion
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Resource Requester",
          email,
          company: company || "Not Specified",
          message: `Requested download: ${resource.title} (${resource.slug})`,
          serviceInterest: "Resource Download",
        }),
      });

      if (!res.ok) {
        // Even if lead capture has warning, still allow direct download for user satisfaction
      }

      trackEvent("resource_download", {
        resourceId: resource.id,
        resourceTitle: resource.title,
      });

      setDownloaded(true);

      // 2. Trigger direct download automatically
      const link = document.createElement("a");
      link.href = resource.publicPath;
      link.download = resource.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (downloaded) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Download Started!</h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Your document is downloading now. If it didn't start automatically, use the button below.
        </p>
        <a
          href={resource.publicPath}
          download={resource.filename}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
        >
          <Download className="w-4 h-4" />
          <span>Download Again</span>
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Morgan"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
          Corporate Email *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@company.com"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
          Company Name
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Acme Corp"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(0,191,255,0.3)] mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download {resource.filename.split(".")[0]}</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
        We respect your privacy. No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
