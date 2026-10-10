"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export default function ShareButton({
  title,
  text,
  url: customUrl,
  className,
}: {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      customUrl ||
      (typeof window !== "undefined" ? window.location.href : "");
    const shareText = text || title;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* user cancelled share sheet */
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ||
        "p-2.5 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] hover:bg-slate-100 text-[var(--lit-navy,#0B2545)] transition-colors"
      }
      aria-label="Share this article"
      title={copied ? "Link copied" : "Share"}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
    </button>
  );
}
