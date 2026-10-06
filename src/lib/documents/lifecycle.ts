/**
 * Pure document lifecycle rules, mirroring the allowed-transition table in the
 * transition_document() SQL function so the UI can gate buttons without a round
 * trip. The database remains the source of truth and re-checks every move.
 */

export const DOCUMENT_STATUSES = [
  "draft",
  "in_review",
  "approved",
  "issued",
  "superseded",
  "void",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

const ALLOWED: Record<DocumentStatus, DocumentStatus[]> = {
  draft: ["in_review", "void"],
  in_review: ["approved", "draft", "void"],
  approved: ["issued", "draft", "void"],
  issued: ["superseded", "void"],
  superseded: ["void"],
  void: [],
};

/** Whether a document may move from one status to another. */
export function isAllowedTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

/** The statuses a document in `from` may move to (for rendering actions). */
export function nextStatuses(from: DocumentStatus): DocumentStatus[] {
  return ALLOWED[from] ?? [];
}

/** A capability name required to perform a given transition. */
export function capabilityForTransition(to: DocumentStatus): string {
  switch (to) {
    case "approved":
      return "documents.approve";
    case "issued":
      return "documents.issue";
    case "in_review":
      return "documents.review";
    default:
      return "documents.review";
  }
}
