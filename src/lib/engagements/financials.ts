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

import { ClientEngagement, EngagementStage } from './types';

export interface ScopeQuotationItem {
  item: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface FinancialBreakdown {
  subtotal: number; // Base amount before taxes
  cgstRate: number; // 0.09 (9%)
  sgstRate: number; // 0.09 (9%)
  gstRate: number; // 0.18 (18%)
  cgstAmount: number; // 9% of subtotal
  sgstAmount: number; // 9% of subtotal
  gstAmount: number; // 18% of subtotal (cgst + sgst)
  totalAmount: number; // subtotal + gstAmount
  depositAmount: number; // 50% Milestone 1
  settlementAmount: number; // 50% Milestone 2

  // Formatted INR strings with currency symbol
  subtotalFormatted: string;
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
 * Safely parse a subtotal or base amount from any raw input (number, formatted string, or range)
 */
export function parseSubtotalAmount(val: unknown, fallback = 50): number {
  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    return val;
  }
  if (typeof val === 'string' && val.trim()) {
    // If it's a range like "₹15,00,000 - ₹25,00,000", parse the lower bound
    const firstPart = val.split(/[-–—to]/i)[0]?.trim() || val;
    const cleaned = firstPart.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }
  return fallback;
}

/**
 * Generate commercial scope items that match the exact subtotal
 */
export function generateScopeItems(subtotal: number, customItems?: ScopeQuotationItem[]): ScopeQuotationItem[] {
  if (customItems && Array.isArray(customItems) && customItems.length > 0) {
    return customItems;
  }

  // If subtotal is small (< ₹10,000, like ₹50 testing or small task), return a single unified deliverable
  if (subtotal < 10000) {
    return [
      {
        item: 'Comprehensive Architecture Engineering & Digital Platform Deliverables',
        description: 'Complete architecture design, implementation, and deployment per Super Admin scope & specification.',
        qty: 1,
        unitPrice: subtotal,
      },
    ];
  }

  // For enterprise scale amounts, distribute proportionally so items sum up to exact subtotal
  const i1 = Math.round(subtotal * 0.45);
  const i2 = Math.round(subtotal * 0.20);
  const i3 = Math.round(subtotal * 0.15);
  const i4 = Math.round(subtotal * 0.10);
  const i5 = Math.max(0, subtotal - (i1 + i2 + i3 + i4));

  return [
    {
      item: 'Core Full-Stack Web Application & 13-Stage Portal Engine',
      description: 'Next.js 15, App Router, responsive multi-device design, state management, and real-time client engagement portal.',
      qty: 1,
      unitPrice: i1,
    },
    {
      item: 'Supabase Security Hardening, Relational Schema & Cryptographic Ledgers',
      description: 'PostgreSQL database architecture, 100% RLS policy enforcement, automated backup triggers, and SHA-256 mutation digests.',
      qty: 1,
      unitPrice: i2,
    },
    {
      item: 'Audited Direct UPI Payment Engine & Super Admin Reconciliation Suite',
      description: 'Zero-PSP manual UPI QR generator, client billing intake gate, duplicate UTR prevention, and dual-document (Invoice/Receipt) PDF engine.',
      qty: 1,
      unitPrice: i3,
    },
    {
      item: 'Multi-Corpus Knowledge Base & Domain-Isolated RAG Assistant Engine',
      description: 'FastEmbed vector embeddings, Groq LPU integration, SQLite BM25 retrieval, and zero-PHI privacy enforcement guardrails.',
      qty: 1,
      unitPrice: i4,
    },
    {
      item: 'Enterprise CI/CD Pipelines, Operating Runbooks & 90-Day SLA Warranty',
      description: 'Automated GitHub Actions workflows, staging/production environments, developer runbooks, and 90 days of priority defect remediation.',
      qty: 1,
      unitPrice: i5,
    },
  ];
}

/**
 * Calculate full financial breakdown and statutory GST from a base subtotal
 */
export function calculateEngagementFinancials(
  inputAmount?: unknown,
  options?: {
    customGstRate?: number; // default 0.18 (18%)
    customDepositPct?: number; // default 0.50 (50%)
    customScopeItems?: ScopeQuotationItem[];
  }
): FinancialBreakdown {
  const subtotal = Math.round(parseSubtotalAmount(inputAmount, 50) * 100) / 100;
  const gstRate = options?.customGstRate ?? 0.18;
  const cgstRate = gstRate / 2; // 0.09
  const sgstRate = gstRate / 2; // 0.09

  // Calculate taxes with 2 decimal precision
  const cgstAmount = Math.round(subtotal * cgstRate * 100) / 100;
  const sgstAmount = Math.round(subtotal * sgstRate * 100) / 100;
  const gstAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100;
  const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

  // 50% deposit and 50% settlement split
  const depositPct = options?.customDepositPct ?? 0.5;
  const depositAmount = Math.round(totalAmount * depositPct * 100) / 100;
  const settlementAmount = Math.round((totalAmount - depositAmount) * 100) / 100;

  const scopeItems = generateScopeItems(subtotal, options?.customScopeItems);

  return {
    subtotal,
    cgstRate,
    sgstRate,
    gstRate,
    cgstAmount,
    sgstAmount,
    gstAmount,
    totalAmount,
    depositAmount,
    settlementAmount,

    subtotalFormatted: formatInr(subtotal),
    cgstFormatted: formatInr(cgstAmount),
    sgstFormatted: formatInr(sgstAmount),
    gstFormatted: formatInr(gstAmount),
    totalFormatted: formatInr(totalAmount),
    depositFormatted: formatInr(depositAmount),
    settlementFormatted: formatInr(settlementAmount),

    depositNumeric: depositAmount.toFixed(2),
    settlementNumeric: settlementAmount.toFixed(2),
    totalNumeric: totalAmount.toFixed(2),

    scopeItems,
  };
}

/**
 * Resolve financials directly from a ClientEngagement and its stages
 */
export function getFinancialsForEngagement(
  engagement: ClientEngagement,
  stages?: EngagementStage[]
): FinancialBreakdown {
  const metadata = (engagement.metadata || {}) as Record<string, unknown>;
  const proposalStage = stages?.find((s) => s.stage_key === 'proposal');
  const proposalSnap = (proposalStage?.snapshot || {}) as Record<string, unknown>;

  // Check candidate sources for subtotal in priority order
  const candidate =
    metadata.contract_subtotal ||
    metadata.subtotal ||
    proposalSnap.subtotal ||
    (proposalSnap.pricing as Record<string, unknown> | undefined)?.subtotal ||
    metadata.contract_value ||
    metadata.budget_range ||
    50;

  const customItems = (
    metadata.commercial_items ||
    proposalSnap.commercialItems ||
    proposalSnap.scopeItems
  ) as ScopeQuotationItem[] | undefined;

  return calculateEngagementFinancials(candidate, {
    customScopeItems: customItems,
  });
}
