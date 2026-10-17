/**
 * LIT 13-Stage Journey & Commercial Redaction Engine
 *
 * Implements strict server-side redaction for:
 * 1. Stage 6 ('initial-invoice') and Stage 11 ('final-payment')
 *    Restricted to Founder / Super Admin only.
 * 2. Commercial / Pricing fields in Change Requests, Quotations, and Documents.
 *
 * Never relies on client-side or CSS hiding. Data is sanitized before serialization.
 */

import { StageKey, StageDefinition } from "@/lib/engagements/types";

export const RESTRICTED_STAGE_KEYS: readonly StageKey[] = [
  'initial-invoice', // Ordinal 6
  'final-payment',   // Ordinal 11
] as const;

export const RESTRICTED_STAGE_ORDINALS: readonly number[] = [6, 11] as const;

export const RESTRICTED_STAGE_PLACEHOLDER =
  "This stage is restricted to the Founder / Super Admin.";

/**
 * Checks if a stage is restricted to Founder / Super Admin.
 */
export function isRestrictedStage(stageKeyOrOrdinal: StageKey | number): boolean {
  if (typeof stageKeyOrOrdinal === 'number') {
    return RESTRICTED_STAGE_ORDINALS.includes(stageKeyOrOrdinal);
  }
  return RESTRICTED_STAGE_KEYS.includes(stageKeyOrOrdinal);
}

export interface RedactedStagePayload {
  ordinal: number;
  key: StageKey;
  title: string;
  shortTitle: string;
  description: string;
  badgeText: string;
  isRestricted: boolean;
  status: string;
  restrictedNotice?: string;
  metadata?: Record<string, any>;
  data?: any;
}

/**
 * Redacts a stage payload for non-super-admin staff inspection.
 * If user is Super Admin, returns the full payload unmodified.
 */
export function redactStageForStaff<T extends { key?: string; ordinal?: number; [key: string]: any }>(
  stage: T,
  isSuperAdmin: boolean
): T | RedactedStagePayload {
  if (isSuperAdmin) {
    return stage;
  }

  const stageKey = (stage.key || '') as StageKey;
  const ordinal = stage.ordinal ?? 0;

  if (isRestrictedStage(stageKey) || isRestrictedStage(ordinal)) {
    return {
      ordinal: stage.ordinal || (stageKey === 'initial-invoice' ? 6 : 11),
      key: stageKey,
      title: stage.title || (stageKey === 'initial-invoice' ? 'Initial Advance Invoice & Payment' : 'Final Balance Invoice & Payment'),
      shortTitle: stage.shortTitle || (stageKey === 'initial-invoice' ? 'Advance Invoice' : 'Balance Invoice'),
      description: RESTRICTED_STAGE_PLACEHOLDER,
      badgeText: `Stage ${String(stage.ordinal || (stageKey === 'initial-invoice' ? 6 : 11)).padStart(2, '0')} · Restricted`,
      isRestricted: true,
      status: 'locked',
      restrictedNotice: RESTRICTED_STAGE_PLACEHOLDER,
      metadata: {},
      data: null,
    };
  }

  // If not restricted stage, return copy with any financial fields stripped
  const sanitized = { ...stage };
  delete sanitized.financialDetails;
  delete sanitized.paymentRequests;
  delete sanitized.invoices;
  delete sanitized.subtotal;
  delete sanitized.grandTotal;
  delete sanitized.taxAmount;
  return sanitized;
}

/**
 * Redacts all stages in an engagement journey list.
 */
export function redactJourneyForStaff<T extends { key?: string; ordinal?: number; [key: string]: any }>(
  stages: T[],
  isSuperAdmin: boolean
): (T | RedactedStagePayload)[] {
  return stages.map((st) => redactStageForStaff(st, isSuperAdmin));
}

/**
 * Redacts commercial fields from client change requests (RFCs).
 */
export function redactChangeRequestForStaff<T extends { estimated_cost_inr?: any; [key: string]: any }>(
  rfc: T,
  isSuperAdmin: boolean
): T {
  if (isSuperAdmin) {
    return rfc;
  }

  const { estimated_cost_inr, ...safe } = rfc;
  return {
    ...safe,
    estimated_cost_inr: null,
    is_cost_redacted: true,
  } as unknown as T;
}

/**
 * Redacts commercial fields from an array of change requests.
 */
export function redactChangeRequestsForStaff<T extends { estimated_cost_inr?: any; [key: string]: any }>(
  rfcs: T[],
  isSuperAdmin: boolean
): T[] {
  return rfcs.map((rfc) => redactChangeRequestForStaff(rfc, isSuperAdmin));
}
