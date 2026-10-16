/**
 * LIT Universal Engagement Financials & Statutory GST Engine
 * 
 * Rules:
 * - Subtotal is the Base Price (e.g. ₹50.00, or Super Admin specified rate).
 * - Statutory GST is 18% (CGST 9% + SGST 9%).
 * - Total Contract Commitment = Subtotal + Total GST.
 * - Milestone 1 (Initial Deposit) = 50% of Total Commitment.
 * - Milestone 2 (Final Settlement) = 50% of Total Commitment.
 * - NEVER hardcodes 18 Lakhs or static numbers; dynamically derives all amounts
 *   from Super Admin configuration, budget_range, or proposal metadata.
 */

import { COMPANY } from '@/config/company';
import { ClientEngagement, EngagementStage } from './types';

export interface ScopeQuotationItem {
  item: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface FinancialBreakdown {
  isPriced: boolean;
  isCommerciallyApproved: boolean;
  gstApplicable: boolean;
  gstinConfigured: boolean;
  subtotal: number; // Base amount before taxes
  discountAmount: number;
  taxableSubtotal: number;
  cgstRate: number;
  sgstRate: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  totalAmount: number;
  depositAmount: number; // 50% Milestone 1 (Initial Advance)
  settlementAmount: number; // 50% Milestone 2 (Final Settlement)

  // Formatted INR strings with currency symbol
  subtotalFormatted: string;
  discountFormatted: string;
  taxableSubtotalFormatted: string;
  cgstFormatted: string;
  sgstFormatted: string;
  gstFormatted: string;
  totalFormatted: string;
  depositFormatted: string;
  settlementFormatted: string;

  // Plain numbers formatted for UPI deep links
  depositNumeric: string;
  settlementNumeric: string;
  totalNumeric: string;

  // Scope items
  scopeItems: ScopeQuotationItem[];
}

/**
 * Format any number to Indian Rupee (INR) format
 */
export function formatInr(n: number, includeDecimals = true): string {
  if (isNaN(n) || n === null || n === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Strict validator for Super Admin pricing inputs: never defaults to ₹50 on invalid/missing input.
 */
export function validateExplicitSubtotalAmount(
  val: unknown
): { ok: true; subtotal: number } | { ok: false; error: string } {
  if (val === null || val === undefined || val === '') {
    return { ok: false, error: 'Explicit positive subtotal is required.' };
  }
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || val <= 0) {
      return { ok: false, error: 'Subtotal must be a finite number greater than zero.' };
    }
    return { ok: true, subtotal: Math.round(val * 100) / 100 };
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) {
      return { ok: false, error: 'Subtotal string cannot be empty.' };
    }
    const cleaned = trimmed.replace(/[₹,\s]/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
      return { ok: false, error: 'Subtotal must be a valid positive currency amount.' };
    }
    const num = Number(cleaned);
    if (!Number.isFinite(num) || num <= 0) {
      return { ok: false, error: 'Subtotal must be greater than zero.' };
    }
    return { ok: true, subtotal: Math.round(num * 100) / 100 };
  }
  return { ok: false, error: 'Unsupported subtotal value type.' };
}

/**
 * Safely parse a subtotal or base amount from any raw input (number, formatted string, or range).
 * Defaults to 0 (unpriced) when no valid positive number is found unless an explicit fallback is passed.
 */
export function parseSubtotalAmount(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
    return val;
  }
  if (typeof val === 'string' && val.trim()) {
    const firstPart = val.split(/[-–—to]/i)[0]?.trim() || val;
    const cleaned = firstPart.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (Number.isFinite(num) && num > 0) {
      return num;
    }
  }
  return fallback;
}

/**
 * Return Super Admin scope items or a single unified scope item matching the exact subtotal.
 * Never fabricates arbitrary 5-item percentages unless explicitly provided in customItems.
 */
export function generateScopeItems(
  subtotal: number,
  customItems?: ScopeQuotationItem[]
): ScopeQuotationItem[] {
  if (customItems && Array.isArray(customItems) && customItems.length > 0) {
    return customItems;
  }
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return [];
  }
  return [
    {
      item: 'Comprehensive Enterprise Architecture & Digital Platform Engineering',
      description:
        'End-to-end architecture design, implementation, verification, and production deployment per Super Admin approved scope.',
      qty: 1,
      unitPrice: subtotal,
    },
  ];
}

/**
 * Calculate full financial breakdown and configurable GST from a base subtotal.
 * Enforces exact two-milestone (50% advance / 50% final) payment schedule.
 */
export function calculateEngagementFinancials(
  inputAmount?: unknown,
  options?:
    | number
    | {
        customGstRate?: number; // e.g., 0.18 (18%) or 0 when GST is not applied
        gstApplicable?: boolean;
        discountAmount?: number;
        customDepositPct?: number; // default 0.50 (50%)
        customScopeItems?: ScopeQuotationItem[];
      }
): FinancialBreakdown {
  const normalizedOpts =
    typeof options === "number"
      ? { customGstRate: options, gstApplicable: options > 0 }
      : (options || {});

  const subtotal = Math.round(parseSubtotalAmount(inputAmount, 0) * 100) / 100;
  const isPriced = subtotal > 0;
  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Math.round((normalizedOpts.discountAmount ?? 0) * 100) / 100)
  );
  const taxableSubtotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  const gstinConfigured = Boolean(COMPANY.registration.gstin);
  const gstApplicable =
    normalizedOpts.gstApplicable !== undefined
      ? normalizedOpts.gstApplicable
      : normalizedOpts.customGstRate !== undefined
        ? normalizedOpts.customGstRate > 0
        : true;

  const gstRate = gstApplicable ? (normalizedOpts.customGstRate ?? 0.18) : 0;
  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;

  const cgstAmount = Math.round(taxableSubtotal * cgstRate * 100) / 100;
  const sgstAmount = Math.round(taxableSubtotal * sgstRate * 100) / 100;
  const gstAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100;
  const totalAmount = Math.round((taxableSubtotal + gstAmount) * 100) / 100;

  // Exact two-milestone 50% Initial Advance + 50% Final Settlement
  const depositPct = normalizedOpts.customDepositPct ?? 0.5;
  const depositAmount = Math.round(totalAmount * depositPct * 100) / 100;
  const settlementAmount = Math.round((totalAmount - depositAmount) * 100) / 100;

  const scopeItems = generateScopeItems(subtotal, normalizedOpts.customScopeItems);

  return {
    isPriced,
    isCommerciallyApproved: isPriced,
    gstApplicable,
    gstinConfigured,
    subtotal,
    discountAmount,
    taxableSubtotal,
    cgstRate,
    sgstRate,
    gstRate,
    cgstAmount,
    sgstAmount,
    gstAmount,
    totalAmount,
    depositAmount,
    settlementAmount,

    subtotalFormatted: isPriced ? formatInr(subtotal) : 'Pending Commercial Approval',
    discountFormatted: formatInr(discountAmount),
    taxableSubtotalFormatted: formatInr(taxableSubtotal),
    cgstFormatted: formatInr(cgstAmount),
    sgstFormatted: formatInr(sgstAmount),
    gstFormatted: formatInr(gstAmount),
    totalFormatted: isPriced ? formatInr(totalAmount) : 'Pending Commercial Approval',
    depositFormatted: isPriced ? formatInr(depositAmount) : 'Pending Commercial Approval',
    settlementFormatted: isPriced ? formatInr(settlementAmount) : 'Pending Commercial Approval',

    depositNumeric: depositAmount.toFixed(2),
    settlementNumeric: settlementAmount.toFixed(2),
    totalNumeric: totalAmount.toFixed(2),

    scopeItems,
  };
}

/**
 * Resolve financials directly from a ClientEngagement and its stages.
 * Never defaults to a fake ₹50 or ₹21.24L fallback if no price is present.
 */
export function getFinancialsForEngagement(
  engagement: ClientEngagement,
  stages?: EngagementStage[]
): FinancialBreakdown {
  const metadata = (engagement.metadata || {}) as Record<string, unknown>;
  const proposalStage = stages?.find((s) => s.stage_key === 'proposal');
  const proposalSnap = (proposalStage?.snapshot || {}) as Record<string, unknown>;

  const candidate =
    metadata.contract_subtotal ??
    metadata.subtotal ??
    proposalSnap.subtotal ??
    (proposalSnap.pricing as Record<string, unknown> | undefined)?.subtotal ??
    metadata.contract_value ??
    metadata.budget_range ??
    0;

  const customItems = (
    metadata.commercial_items ||
    proposalSnap.commercialItems ||
    proposalSnap.scopeItems
  ) as ScopeQuotationItem[] | undefined;

  const gstApplicable =
    typeof metadata.gst_applicable === 'boolean'
      ? metadata.gst_applicable
      : undefined;

  const discountAmount =
    typeof metadata.discount_amount === 'number'
      ? metadata.discount_amount
      : typeof proposalSnap.discountAmount === 'number'
        ? proposalSnap.discountAmount
        : 0;

  return calculateEngagementFinancials(candidate, {
    customScopeItems: customItems,
    gstApplicable,
    discountAmount,
  });
}

