"use client";

export default function AiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] px-6">
      <div className="w-full max-w-md text-center rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)] mb-3">Logic AI</p>
        <h1 className="font-display text-2xl font-bold text-[var(--lit-navy,#0B2545)] mb-3">The assistant could not load</h1>
        <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6">
          {error.message || "A client error stopped this page. Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then retry."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
