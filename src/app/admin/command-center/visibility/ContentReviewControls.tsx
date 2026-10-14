"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { reviewSuggestion } from "./actions";

/**
 * Approve / Reject controls for a single content suggestion. Applied
 * suggestions are read-only. Shows the current status as a badge.
 */
export function ContentReviewControls({
  id,
  status,
}: {
  id: string;
  status: "draft" | "approved" | "rejected" | "applied";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function decide(decision: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const res = await reviewSuggestion({ id, decision });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const badge = (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        status === "approved"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : status === "rejected"
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : status === "applied"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      {status}
    </span>
  );

  if (status === "applied") {
    return <div className="flex items-center gap-2">{badge}</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badge}
      <button
        type="button"
        disabled={pending || status === "approved"}
        onClick={() => decide("approved")}
        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Check className="h-3 w-3" />
        Approve
      </button>
      <button
        type="button"
        disabled={pending || status === "rejected"}
        onClick={() => decide("rejected")}
        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="h-3 w-3" />
        Reject
      </button>
      {error ? <span className="text-[11px] font-medium text-rose-600">{error}</span> : null}
    </div>
  );
}
