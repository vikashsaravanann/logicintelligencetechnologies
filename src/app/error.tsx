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
    <main
      id="main-content"
      className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Error 500</p>
        <h1 className="mt-2 text-xl font-bold text-white">This page failed to load</h1>
        <p className="mt-2 text-sm text-slate-300">
          Retry, or return to a safe page. If the problem continues, contact support with the
          reference below.
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-amber-300">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
          <Link
            href="/staff/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Staff Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
