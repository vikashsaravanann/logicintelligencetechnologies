"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center" role="alert">
      <h1 className="text-lg font-bold text-white">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-400">
        This page could not be loaded. The error has been logged.
      </p>
      {error.digest ? (
        <p className="mt-1 font-mono text-[11px] text-neutral-600">Ref: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
      >
        Try again
      </button>
    </div>
  );
}
