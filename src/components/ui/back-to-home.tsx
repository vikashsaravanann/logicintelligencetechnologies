"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Fixed under the navbar, left. Never sits in the document flow,
 * so it cannot cover headings, CTAs, or hero copy.
 */
export default function BackToHome({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none fixed top-[4.75rem] sm:top-[5rem] left-0 right-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[10px] font-black text-black uppercase tracking-[0.18em] bg-white/95 hover:bg-white active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(0,0,0,0.35)] select-none"
        >
          <ChevronLeft className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
