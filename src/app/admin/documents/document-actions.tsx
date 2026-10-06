"use client";

import { transitionDocumentAction } from "./actions";

interface DocumentActionsProps {
  documentId: string;
  status: string;
  nextStatuses: string[];
}

export function DocumentActions({ documentId, status, nextStatuses }: DocumentActionsProps) {
  if (nextStatuses.length === 0) {
    return <p className="text-xs text-neutral-500">No transitions available from “{status}”.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((to) => (
        <form key={to} action={transitionDocumentAction}>
          <input type="hidden" name="documentId" value={documentId} />
          <input type="hidden" name="toStatus" value={to} />
          <button
            type="submit"
            className="rounded-lg border border-neutral-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            Move to {to}
          </button>
        </form>
      ))}
    </div>
  );
}
