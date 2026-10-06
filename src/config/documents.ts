/**
 * The LIT document registry. One entry per approved master template. The seven
 * masters were supplied by the founder (services/pdf-renderer/masters/) with a
 * SHA256SUMS.txt; the hashes below are those real master digests.
 *
 * masterStatus = MASTER_UPLOADED: a blank approved master PDF exists.
 * templateStatus = REQUIRES_HUMAN_ACTION: auto-filling a master from client
 * data for production issuance is NOT yet approved per type — a human approves
 * each type's fill template in the Document Center before issuance. No legal
 * text lives here; this is metadata only.
 */

export type MasterStatus = "MASTER_UPLOADED" | "MISSING";
export type TemplateStatus = "REQUIRES_HUMAN_ACTION" | "APPROVED";
export type DocClassification = "internal" | "client_confidential";

export interface DocumentType {
  key: string;
  /** Display name (no legal wording). */
  name: string;
  /** Server reference prefix, matches next_reference ^LIT-[A-Z]{2,5}$. */
  referencePrefix: string;
  /** The approved blank master file name under services/pdf-renderer/masters/. */
  masterFile: string;
  /** SHA-256 of the approved master (from masters/SHA256SUMS.txt). */
  masterSha256: string;
  masterStatus: MasterStatus;
  templateStatus: TemplateStatus;
  classification: DocClassification;
  /** Whether issuing this type records a signature (agreements do). */
  requiresSignature: boolean;
}

export const DOCUMENT_TYPES: Record<string, DocumentType> = {
  sow: {
    key: "sow",
    name: "Statement of Work / Service Agreement",
    referencePrefix: "LIT-SOW",
    masterFile: "LIT-01-SOW-Service-Agreement.pdf",
    masterSha256: "aae21b5c99b3124cd7ed0fb7772116fd6a32aedeae6b882df9256d61c5adb705",
    masterStatus: "MASTER_UPLOADED",
    templateStatus: "REQUIRES_HUMAN_ACTION",
    classification: "client_confidential",
    requiresSignature: true,
  },
  proposal: {
    key: "proposal",
    name: "Proposal / Commercial Quotation",
    referencePrefix: "LIT-PROP",
    masterFile: "LIT-02-Proposal-Commercial-Quotation.pdf",
    masterSha256: "fe22bb411746dadc47ff00784dbde078b3504e77a5b3641627b5840f8006ade0",
    masterStatus: "MASTER_UPLOADED",
    templateStatus: "REQUIRES_HUMAN_ACTION",
    classification: "client_confidential",
    requiresSignature: false,
  },
  onboarding_guide: {
    key: "onboarding_guide",
    name: "Client Onboarding Guide",
    referencePrefix: "LIT-ONB",
    masterFile: "LIT-03-Client-Onboarding-Guide.pdf",
    masterSha256: "2eb90cc25c9233efe379337dd62ec6dfc1e117f434c3f4d6ca24f6a1b1c012c4",
    masterStatus: "MASTER_UPLOADED",
    templateStatus: "REQUIRES_HUMAN_ACTION",
    classification: "client_confidential",
    requiresSignature: false,
  },
  tech_spec: {
    key: "tech_spec",
    name: "Technical Specification",
    referencePrefix: "LIT-TECH",
    masterFile: "LIT-04-Technical-Specification.pdf",
    masterSha256: "ad08197bf679de21f68b43a3f86cd0e5d6e11cd441b0dffea722bfb461449fa9",
    masterStatus: "MASTER_UPLOADED",
    templateStatus: "REQUIRES_HUMAN_ACTION",
    classification: "client_confidential",
    requiresSignature: false,
  },
  delivery_acceptance: {
    key: "delivery_acceptance",
    name: "Delivery & Acceptance Report",
    referencePrefix: "LIT-DEL",
    masterFile: "LIT-05-Delivery-Acceptance-Report.pdf",
    masterSha256: "eb24de72fb194d6a15fa8981b9d8fece16773bcdc50596a9b58475910691cdd4",
    masterStatus: "MASTER_UPLOADED",
    templateStatus: "REQUIRES_HUMAN_ACTION",
    classification: "client_confidential",
    requiresSignature: false,
  },
  change_request: {
    key: "change_request",
    name: "Change Request",
    referencePrefix: "LIT-CR",
    masterFile: "LIT-06-Change-Request.pdf",
    masterSha256: "0c42d12fb227c209781577907a368278dfdd968b1a8ebe0bac976ca785e1d409",
    masterStatus: "MASTER_UPLOADED",
    templateStatus: "REQUIRES_HUMAN_ACTION",
    classification: "client_confidential",
    requiresSignature: false,
  },
  maintenance_support: {
    key: "maintenance_support",
    name: "Maintenance & Support Agreement",
    referencePrefix: "LIT-SUP",
    masterFile: "LIT-07-Maintenance-Support-Agreement.pdf",
    masterSha256: "89c4eacd68fa5ddc64070d7c02ac2ad7c4e2a53f85146b4f037b09ba681f784b",
    masterStatus: "MASTER_UPLOADED",
    templateStatus: "REQUIRES_HUMAN_ACTION",
    classification: "client_confidential",
    requiresSignature: true,
  },
};

export const DOCUMENT_TYPE_KEYS = Object.keys(DOCUMENT_TYPES);

export function getDocumentType(key: string): DocumentType | null {
  return Object.prototype.hasOwnProperty.call(DOCUMENT_TYPES, key) ? DOCUMENT_TYPES[key] : null;
}
