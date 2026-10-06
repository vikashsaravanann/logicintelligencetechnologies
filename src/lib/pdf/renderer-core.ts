/**
 * Pure helpers for talking to the ReportLab PDF service (the generator the
 * founder supplied, wrapped in a FastAPI service). The service fills an
 * approved blank master from a JSON data model: a `common` block plus a
 * per-document block keyed "01".."07". No network here.
 */

import { getDocumentType } from "@/config/documents";

/** Map a registry key to the generator's document number. */
const DOC_NUMBER: Record<string, string> = {
  sow: "01",
  proposal: "02",
  onboarding_guide: "03",
  tech_spec: "04",
  delivery_acceptance: "05",
  change_request: "06",
  maintenance_support: "07",
};

export interface RenderRequest {
  doc: string; // "01".."07"
  data: { common?: Record<string, unknown> } & Record<string, unknown>;
}

/**
 * Build the service request body for a document type. Throws for an unknown
 * type. `data` is the client fill data (common + the per-doc block); the caller
 * is responsible for only passing an approved template's data.
 */
export function buildRenderRequest(docKey: string, data: Record<string, unknown>): RenderRequest {
  const type = getDocumentType(docKey);
  const doc = DOC_NUMBER[docKey];
  if (!type || !doc) throw new Error(`Unknown document type: ${docKey}`);
  return { doc, data: data ?? {} };
}

/** Validate a service response buffer looks like a PDF (magic + size). */
export function looksLikePdf(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
}
