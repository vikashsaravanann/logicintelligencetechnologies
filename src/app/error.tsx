"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-24 text-center text-white">
      <p className="lit-eyebrow mb-6">Error 500</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">Something went wrong</h1>
      <p className="max-w-md text-zinc-300 mb-10 leading-relaxed">
        This page failed to load. Retry, or return to the homepage.
      </p>
      {error.digest && <p className="mb-8 font-mono text-xs text-zinc-500">Reference: {error.digest}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="lit-btn lit-btn-primary">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
        <Link href="/" className="lit-btn lit-btn--secondary">
          <Home className="h-4 w-4" aria-hidden />
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}
