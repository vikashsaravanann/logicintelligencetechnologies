export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-700 border-t-indigo-400" aria-hidden />
        Loading…
      </div>
    </div>
  );
}
