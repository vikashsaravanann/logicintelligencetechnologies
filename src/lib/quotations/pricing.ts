/**
 * Pure, deterministic pricing and calculation engine for V6 Quotations
 * 
 * Strict invariants:
 * - Integer paise (minor currency units) for all monetary math.
 * - Exactly two 50% payment milestones with sum conservation:
 *   milestone1Paise = Math.floor(totalPayablePaise / 2)
 *   milestone2Paise = totalPayablePaise - milestone1Paise
 *   milestone1Paise + milestone2Paise === totalPayablePaise
 * - Zero leaking of unselected or unpriced lines in public projections.
 * - Selected unpriced lines block publish readiness.
 */

import {
  QuotationLineItem,
  QuotationRecord,
  QuotationCoupon,
  PublicQuotationProjection,
  PublicQuotationLineItem,
  QuotationCalculationResult,
} from '@/types/quotations';

export const DEFAULT_LIT_ISSUER = {
  legal_name: 'LOGIC INTELLIGENCE TECHNOLOGIES',
  msme_udyam: 'UDYAM-TN-03-0345274',
  msme_category: 'Micro Enterprise · Services',
  registered_address: 'Eachanari, Coimbatore, Tamil Nadu 641021, India',
  official_email: 'hello@logicintelligencetechnologies.in',
  official_website: 'https://www.logicintelligencetechnologies.in',
  founder_signatory: 'Vikash Saravanan, Founder',
  gstin_notice: 'GSTIN: Unregistered (Composition / Threshold)',
} as const;

export const STANDARD_QUOTATION_TERMS: string[] = [
  'This quotation is valid for 30 calendar days from the date of issue.',
  'Project execution requires an executed Statement of Work (SOW) prior to active engineering commencement.',
  'Payment structure comprises exactly two 50% milestones: Milestone 1 upon SOW execution prior to active development, and Milestone 2 upon formal delivery acceptance prior to source code and IP access transfer.',
  'Quotation acceptance confirms agreed scope and pricing, but does not constitute a payment receipt or executed contract.',
  'Any scope modifications requested during execution will be evaluated and governed by formal change requests.',
  'Client is responsible for providing necessary brand assets, content, third-party API credentials, and required environment access in a timely manner.',
];

/**
 * Converts Indian Rupees to integer Paise.
 */
export function rupeesToPaise(rupees: number | null | undefined): number {
  if (typeof rupees !== 'number' || isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Converts integer Paise to Indian Rupees.
 */
export function paiseToRupees(paise: number | null | undefined): number {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return paise / 100;
}

/**
 * Format integer paise into Indian Currency string (INR)
 * e.g. 5000000 -> "₹50,000.00"
 */
export function formatPaiseToINR(paise: number | null | undefined, includeDecimals = true): string {
  const safePaise = typeof paise === 'number' && !isNaN(paise) ? paise : 0;
  const rupees = safePaise / 100;
  return (
    '₹' +
    rupees.toLocaleString('en-IN', {
      minimumFractionDigits: includeDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Calculates extended line total in integer paise.
 * Returns 0 if included at no charge or if price is null/quantity <= 0.
 */
export function calculateLineTotal(
  unitPricePaise: number | null,
  quantity: number,
  isIncludedNoCharge: boolean
): number {
  if (isIncludedNoCharge) return 0;
  if (unitPricePaise === null || unitPricePaise === undefined || quantity <= 0) return 0;
  return Math.round(unitPricePaise * quantity);
}

/**
 * Calculates subtotal for all selected lines in integer paise.
 */
export function calculateSubtotal(lines: QuotationLineItem[]): number {
  return lines.reduce((acc, line) => {
    if (!line.is_selected) return acc;
    return (
      acc +
      calculateLineTotal(
        line.quoted_unit_price_paise,
        line.quantity,
        line.included_at_no_additional_charge
      )
    );
  }, 0);
}

/**
 * Calculates discount in integer paise from coupon and/or manual founder discount.
 * Enforces non-negative bounds and caps at subtotal.
 */
export function calculateDiscount(
  subtotalPaise: number,
  coupon?: QuotationCoupon | null,
  manualDiscountPaise: number = 0
): { discountPaise: number; label: string } {
  const subtotal = Math.max(0, Math.round(subtotalPaise || 0));
  const manual = Math.max(0, Math.round(manualDiscountPaise || 0));

  let couponDiscount = 0;
  let couponLabel = '';

  if (coupon && coupon.is_active) {
    const meetsMin = !coupon.min_subtotal_paise || subtotal >= coupon.min_subtotal_paise;
    if (meetsMin) {
      if (coupon.discount_type === 'percentage' && typeof coupon.discount_percentage === 'number') {
        const raw = Math.round(subtotal * (coupon.discount_percentage / 100));
        couponDiscount = coupon.max_discount_paise ? Math.min(raw, coupon.max_discount_paise) : raw;
        couponLabel = `${coupon.code} (${coupon.discount_percentage}%)`;
      } else if (coupon.discount_type === 'fixed_paise' && typeof coupon.discount_paise === 'number') {
        const raw = Math.round(coupon.discount_paise);
        couponDiscount = coupon.max_discount_paise ? Math.min(raw, coupon.max_discount_paise) : raw;
        couponLabel = `${coupon.code} (${formatPaiseToINR(couponDiscount)})`;
      }
    }
  }

  let totalDiscount = 0;
  const labelParts: string[] = [];

  if (couponDiscount > 0 && manual > 0) {
    if (coupon?.can_stack) {
      totalDiscount = manual + couponDiscount;
      labelParts.push(`Manual: ${formatPaiseToINR(manual)}`, couponLabel);
    } else {
      if (couponDiscount >= manual) {
        totalDiscount = couponDiscount;
        labelParts.push(couponLabel);
      } else {
        totalDiscount = manual;
        labelParts.push(`Manual Discount (${formatPaiseToINR(manual)})`);
      }
    }
  } else if (couponDiscount > 0) {
    totalDiscount = couponDiscount;
    labelParts.push(couponLabel);
  } else if (manual > 0) {
    totalDiscount = manual;
    labelParts.push(`Manual Discount (${formatPaiseToINR(manual)})`);
  }

  // Non-negative bound and capped at subtotal
  const discountPaise = Math.min(subtotal, Math.max(0, totalDiscount));
  const label = labelParts.join(' + ') || 'No Discount';

  return { discountPaise, label };
}

/**
 * Pure calculation for dual 50/50 payment milestones.
 * Invariant: milestone1Paise + milestone2Paise === totalPayablePaise
 */
export function calculateMilestones(totalPayablePaise: number): {
  milestone1Paise: number;
  milestone2Paise: number;
  roundingAdjustmentPaise: number;
} {
  const total = Math.max(0, Math.round(totalPayablePaise || 0));
  const milestone1Paise = Math.floor(total / 2);
  const milestone2Paise = total - milestone1Paise;
  const roundingAdjustmentPaise = milestone2Paise - milestone1Paise;

  if (milestone1Paise + milestone2Paise !== total) {
    throw new Error(
      `Milestone allocation invariant failed: ${milestone1Paise} + ${milestone2Paise} !== ${total}`
    );
  }

  return { milestone1Paise, milestone2Paise, roundingAdjustmentPaise };
}

/**
 * Validates whether a quotation is ready for founder review or publishing.
 * Invariants:
 * - At least 1 selected line.
 * - Every selected line MUST have (quoted_unit_price_paise !== null && quoted_unit_price_paise > 0) OR included_at_no_additional_charge === true.
 * - Any selected unpriced line blocks publication with exact error:
 *   "Line [title] is selected but unpriced. Enter an approved price or remove."
 */
export function validatePublishReadiness(
  lines: QuotationLineItem[],
  quotation?: Partial<QuotationRecord>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const selectedLines = lines.filter((l) => l.is_selected);
  if (selectedLines.length === 0) {
    errors.push('At least one service line must be selected.');
  }

  for (const line of selectedLines) {
    const isPriced =
      line.quoted_unit_price_paise !== null &&
      line.quoted_unit_price_paise !== undefined &&
      line.quoted_unit_price_paise > 0;
    const isIncluded = line.included_at_no_additional_charge === true;

    if (!isPriced && !isIncluded) {
      const lineName = line.title || line.service_code || 'Service';
      errors.push(`Line [${lineName}] is selected but unpriced. Enter an approved price or remove.`);
    }

    if (line.quantity <= 0) {
      const lineName = line.title || line.service_code || 'Service';
      errors.push(`Line [${lineName}] has an invalid quantity: ${line.quantity}. Must be greater than 0.`);
    }
  }

  if (quotation) {
    if (quotation.project_title !== undefined && !quotation.project_title?.trim()) {
      errors.push('Project title is required.');
    }
    if (quotation.recipient_email !== undefined && !quotation.recipient_email?.trim()) {
      errors.push('Recipient email is required.');
    }
    if (
      quotation.company_name !== undefined &&
      !quotation.company_name?.trim() &&
      !quotation.recipient_name?.trim()
    ) {
      errors.push('Recipient name or company name is required.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Comprehensive quotation calculation helper
 */
export function calculateQuotation(
  lines: QuotationLineItem[],
  coupon?: QuotationCoupon | null,
  manualDiscountPaise: number = 0,
  taxPaise: number = 0,
  quotation?: Partial<QuotationRecord>
): QuotationCalculationResult {
  const subtotalPaise = calculateSubtotal(lines);
  const { discountPaise } = calculateDiscount(subtotalPaise, coupon, manualDiscountPaise);
  const tax = Math.max(0, Math.round(taxPaise || 0));
  const totalPayablePaise = Math.max(0, subtotalPaise - discountPaise + tax);
  const { milestone1Paise, milestone2Paise, roundingAdjustmentPaise } =
    calculateMilestones(totalPayablePaise);

  const { isValid, errors } = validatePublishReadiness(lines, quotation);

  return {
    subtotalPaise,
    discountPaise,
    taxPaise: tax,
    totalPayablePaise,
    milestone1Paise,
    milestone2Paise,
    roundingAdjustmentPaise,
    isValidForPublish: isValid,
    validationErrors: errors,
  };
}

/**
 * Produces a client-safe projection of a quotation.
 * CRITICAL INVARIANT: Filters out all lines where !line.is_selected or
 * (line.quoted_unit_price_paise === null && !line.included_at_no_additional_charge).
 * Never leaks unselected or unpriced rows into client projection.
 * Excludes internal notes.
 */
export function projectPublicQuotation(
  quote: QuotationRecord,
  lines: QuotationLineItem[],
  issuerDetails?: Partial<PublicQuotationProjection['issuer']>
): PublicQuotationProjection {
  const eligibleLines = lines.filter(
    (line) =>
      line.is_selected &&
      ((line.quoted_unit_price_paise !== null &&
        line.quoted_unit_price_paise !== undefined &&
        line.quoted_unit_price_paise > 0) ||
        line.included_at_no_additional_charge === true)
  );

  const subtotalPaise = eligibleLines.reduce((acc, line) => {
    return (
      acc +
      calculateLineTotal(
        line.quoted_unit_price_paise,
        line.quantity,
        line.included_at_no_additional_charge
      )
    );
  }, 0);

  const discountPaise = Math.min(subtotalPaise, Math.max(0, quote.discount_paise || 0));
  const taxPaise = Math.max(0, quote.tax_paise || 0);
  const totalPayablePaise = Math.max(0, subtotalPaise - discountPaise + taxPaise);
  const { milestone1Paise, milestone2Paise } = calculateMilestones(totalPayablePaise);

  const items: PublicQuotationLineItem[] = eligibleLines.map((line, idx) => {
    const unitPrice = line.included_at_no_additional_charge
      ? 0
      : (line.quoted_unit_price_paise ?? 0);
    const extended = calculateLineTotal(
      line.quoted_unit_price_paise,
      line.quantity,
      line.included_at_no_additional_charge
    );

    return {
      item_number: idx + 1,
      service_code: line.service_code,
      category_name: line.category_name || 'General Services',
      title: line.title,
      scope_summary: line.scope_summary,
      deliverables: line.deliverables ? [...line.deliverables] : undefined,
      unit: line.unit || 'project',
      quantity: line.quantity,
      quoted_unit_price_paise: unitPrice,
      extended_amount_paise: extended,
      included_at_no_additional_charge: line.included_at_no_additional_charge,
      inclusion_rationale: line.inclusion_rationale || undefined,
    };
  });

  const issuer = {
    ...DEFAULT_LIT_ISSUER,
    ...issuerDetails,
  };

  return {
    quotation_ref: quote.quotation_ref,
    version_number: quote.version_number,
    project_title: quote.project_title,
    project_brief: quote.project_brief || undefined,
    timeline_estimate: quote.timeline_estimate || undefined,
    currency: quote.currency || 'INR',
    date_issued: quote.issued_at || new Date().toISOString().split('T')[0],
    valid_until: quote.valid_until || '',
    status: quote.status,
    issuer,
    client: {
      company_name: quote.company_name,
      contact_name: quote.recipient_name,
      contact_email: quote.recipient_email,
      contact_phone: quote.recipient_phone || undefined,
      billing_address: quote.billing_address || undefined,
      city_state_pin: quote.city_state_pin || undefined,
    },
    items,
    subtotal_paise: subtotalPaise,
    discount_paise: discountPaise,
    discount_label: quote.discount_label || (discountPaise > 0 ? 'Applied Discount' : undefined),
    tax_paise: taxPaise,
    tax_label: quote.tax_label || undefined,
    total_payable_paise: totalPayablePaise,
    milestone_1_paise: milestone1Paise,
    milestone_2_paise: milestone2Paise,
    milestone_1_description:
      'Initial Project Commitment (50%) — Due upon contract/SOW execution, before work commences',
    milestone_2_description:
      'Final Project Settlement (50%) — Due upon delivery acceptance, before source code/IP handover',
    terms: quote.terms && quote.terms.length > 0 ? [...quote.terms] : [...STANDARD_QUOTATION_TERMS],
    version_hash: quote.latest_version_id || undefined,
  };
}
