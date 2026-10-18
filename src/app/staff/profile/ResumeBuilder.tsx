"use client";

import { useState } from "react";

export function ResumeBuilder() {
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Professional Resume Builder</h2>
        <p className="mt-1 text-xs text-slate-600">
          Generate a resume from your saved Staff Profile using the approved LIT reference layout
          (A4, DejaVu Sans, navy section headings). Private fields, employee code and system role
          are never included.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setPreviewing(true);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Preview Resume
        </button>
        <a
          href="/api/staff/resume?download=1"
          className="inline-flex rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-3 py-2 text-sm font-semibold text-white"
        >
          Export Resume as PDF
        </a>
      </div>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      {previewing ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-medium text-slate-600">A4 preview</p>
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              onClick={() => setPreviewing(false)}
            >
              Close
            </button>
          </div>
          <iframe
            title="Resume preview"
            src="/api/staff/resume"
            className="h-[70vh] w-full bg-white"
          />
        </div>
      ) : null}
    </section>
  );
}
