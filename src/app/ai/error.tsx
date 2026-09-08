"use client";

export default function AiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-[#0a0604] text-[#F3EDE4] px-6">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400 mb-3">Logic AI</p>
        <h1 className="text-2xl font-semibold mb-3">The assistant could not load</h1>
        <p className="text-sm text-white/60 leading-relaxed mb-6">
          {error.message || "A client error stopped this page. Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then retry."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#E8651C] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
