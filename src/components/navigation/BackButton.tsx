"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export interface BackButtonProps {
  /** Target route if history is not available or external */
  fallbackHref?: string;
  /** Explicit accessible button label (e.g. 'Back to Blog', 'Back to Home') */
  label?: string;
  /** Optional parent section name */
  parentLabel?: string;
  /** Extra CSS classes */
  className?: string;
  /** Render inline in document flow instead of fixed top layout */
  inline?: boolean;
  /** Force explicit Link navigation instead of attempting router.back() */
  forceFallback?: boolean;
}

const PILL_CLASSES =
  "group pointer-events-auto inline-flex items-center gap-2 h-9 px-4 rounded-full text-[11px] font-black uppercase tracking-[0.16em] " +
  "bg-white/95 hover:bg-white text-zinc-950 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800 " +
  "border border-white/20 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)] " +
  "hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)] active:scale-[0.98] transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814] select-none";

/**
 * Reusable BackButton component for Logic Intelligence Technologies.
 * Enforces unified visual style and context-aware fallback destinations across all pages.
 */
export function BackButton({
  fallbackHref = "/",
  label = "Back to Home",
  parentLabel,
  className = "",
  inline = false,
  forceFallback = false,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (forceFallback) return;

    // Check if we can safely navigate backward in browser history
    if (typeof window !== "undefined") {
      const hasHistory = window.history.length > 1;
      const sameOriginReferrer =
        document.referrer && document.referrer.startsWith(window.location.origin);

      if (hasHistory && sameOriginReferrer) {
        e.preventDefault();
        router.back();
      }
    }
  };

  const displayText = parentLabel ? `Back to ${parentLabel}` : label;

  const buttonContent = (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={`${PILL_CLASSES} ${inline ? "" : "backdrop-blur-md"}`}
      aria-label={displayText}
    >
      <ChevronLeft
        className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 text-cyan-500 dark:text-cyan-400"
        strokeWidth={2.5}
        aria-hidden="true"
      />
      <span>{displayText}</span>
    </Link>
  );

  if (inline) {
    return <div className={`inline-block ${className}`}>{buttonContent}</div>;
  }

  return (
    <div
      className={`fixed top-20 sm:top-22 left-0 right-0 z-40 pointer-events-none ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {buttonContent}
      </div>
    </div>
  );
}

export default BackButton;
