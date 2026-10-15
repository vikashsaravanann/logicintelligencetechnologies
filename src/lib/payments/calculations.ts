/**
 * Pure calculation and validation logic for payments, taxes, and UPI.
 * Safe for use in both Server Components, Server Actions, and Client Components.
 */

import type {
  CompanyCredentials,
  PaymentBeneficiaryProfile,
  TaxCalculationInput,
  TaxCalculationResult,
  UpiUriOptions,
} from "@/types/payments";

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const SHA256_REGEX = /^[0-9a-f]{64}$/;

export const DEFAULT_COMPANY_CREDENTIALS: Readonly<Omit<CompanyCredentials, "id" | "updated_at" | "created_at">> = {
  enterprise_name: "LOGIC INTELLIGENCE TECHNOLOGIES",
  msme_udyam_number: "UDYAM-TN-03-0345274",
  msme_category: "Micro Enterprise",
  major_activity: "Services",
  registered_address: "Eachanari, Coimbatore, Tamil Nadu 641021",
  gstin: null,
  pan: null,
  official_email: "hello@logicintelligencetechnologies.in",
  official_website: "https://www.logicintelligencetechnologies.in",
  updated_by: null,
};

export const DEFAULT_BENEFICIARY_PROFILE: Readonly<Omit<PaymentBeneficiaryProfile, "id" | "updated_at" | "created_at">> = {
  profile_label: "Founder Primary UPI",
  upi_id: "9342877474@ptyes",
  account_holder_name: "S VIKASH",
  display_brand_name: "Logic Intelligence Technologies",
  is_active: true,
  verified_at: null,
  verified_by: null,
};

/**
 * Checks if place of supply is within Tamil Nadu (State Code 33).
 */
export function isTamilNaduPlaceOfSupply(placeOfSupply?: string | null): boolean {
  if (!placeOfSupply) return true; // Default intrastate if unspecified
  const clean = placeOfSupply.trim().toLowerCase();
  return (
    clean === "33" ||
    clean.startsWith("33-") ||
    clean.startsWith("33 -") ||
    clean === "tn" ||
    clean === "tamil nadu" ||
    clean === "tamilnadu" ||
    clean.includes("tamil nadu") ||
    clean.includes("tamilnadu")
  );
}

/**
 * Validates standard Indian GSTIN format.
 */
export function isValidGstin(gstin: string | null | undefined): boolean {
  if (!gstin) return false;
  return GSTIN_REGEX.test(gstin.trim());
}

/**
 * Validates standard Indian PAN format.
 */
export function isValidPan(pan: string | null | undefined): boolean {
  if (!pan) return false;
  return PAN_REGEX.test(pan.trim());
}

/**
 * Validates 64-character lowercase hexadecimal SHA-256 string.
 */
export function isValidSha256(hash: string | null | undefined): boolean {
  if (!hash) return false;
  return SHA256_REGEX.test(hash.trim().toLowerCase());
}

/**
 * Formats non-negative integer paise into decimal Indian Rupees (e.g. 150000 -> "1,500.00").
 */
export function formatPaiseToRupees(paise: number): string {
  const amount = Math.max(0, paise) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates GST breakdown in non-negative integer paise.
 * Supports intrastate (CGST + SGST) and interstate (IGST).
 */
export function calculateTaxAndTotals(input: TaxCalculationInput): TaxCalculationResult {
  const rawSubtotal = typeof input.subtotalPaise === "bigint" ? Number(input.subtotalPaise) : input.subtotalPaise;
  const subtotalPaise = Math.max(0, Math.round(rawSubtotal));
  const rawDiscount = typeof input.discountPaise === "bigint" ? Number(input.discountPaise) : (input.discountPaise ?? 0);
  const discountPaise = Math.max(0, Math.min(subtotalPaise, Math.round(rawDiscount)));
  const taxMode = input.taxMode ?? "tax_exclusive";
  const gstRateBps = Math.max(0, Math.round(input.gstRateBps ?? 1800)); // Default 18% = 1800 bps

  let isInterstate = input.isInterstate ?? false;
  if (input.placeOfSupply !== undefined) {
    isInterstate = !isTamilNaduPlaceOfSupply(input.placeOfSupply);
  }

  const rawNetPaise = Math.max(0, subtotalPaise - discountPaise);

  if (taxMode === "exempt" || gstRateBps === 0) {
    return {
      subtotalPaise,
      discountPaise,
      taxableAmountPaise: rawNetPaise,
      taxMode,
      gstRateBps: 0,
      isInterstate,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: 0,
      totalTaxPaise: 0,
      totalPayablePaise: rawNetPaise,
    };
  }

  if (taxMode === "tax_inclusive") {
    // Total payable is rawNetPaise; back-calculate taxable base
    const totalPayablePaise = rawNetPaise;
    const taxableAmountPaise = Math.round((totalPayablePaise * 10000) / (10000 + gstRateBps));
    const totalTaxPaise = Math.max(0, totalPayablePaise - taxableAmountPaise);

    let cgstPaise = 0;
    let sgstPaise = 0;
    let igstPaise = 0;

    if (isInterstate) {
      igstPaise = totalTaxPaise;
    } else {
      cgstPaise = Math.floor(totalTaxPaise / 2);
      sgstPaise = totalTaxPaise - cgstPaise;
    }

    return {
      subtotalPaise,
      discountPaise,
      taxableAmountPaise,
      taxMode,
      gstRateBps,
      isInterstate,
      cgstPaise,
      sgstPaise,
      igstPaise,
      totalTaxPaise,
      totalPayablePaise,
    };
  }

  // tax_exclusive
  const taxableAmountPaise = rawNetPaise;
  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (isInterstate) {
    igstPaise = Math.round((taxableAmountPaise * gstRateBps) / 10000);
  } else {
    const halfBps = Math.floor(gstRateBps / 2);
    cgstPaise = Math.round((taxableAmountPaise * halfBps) / 10000);
    sgstPaise = Math.round((taxableAmountPaise * (gstRateBps - halfBps)) / 10000);
  }

  const totalTaxPaise = cgstPaise + sgstPaise + igstPaise;
  const totalPayablePaise = taxableAmountPaise + totalTaxPaise;

  return {
    subtotalPaise,
    discountPaise,
    taxableAmountPaise,
    taxMode,
    gstRateBps,
    isInterstate,
    cgstPaise,
    sgstPaise,
    igstPaise,
    totalTaxPaise,
    totalPayablePaise,
  };
}

/**
 * Builds a standards-compliant NPCI UPI Deep Link (upi://pay).
 */
export function buildUpiUri(options: UpiUriOptions): string {
  const amountRupees = (Math.max(0, options.amountPaise) / 100).toFixed(2);
  const params = new URLSearchParams();

  params.set("pa", options.payeeVpa.trim());
  params.set("pn", options.payeeName.trim());
  params.set("tn", options.transactionNote.trim());
  params.set("am", amountRupees);
  params.set("cu", "INR");

  if (options.transactionRef) {
    params.set("tr", options.transactionRef.trim());
  }

  if (options.merchantCode) {
    params.set("mc", options.merchantCode.trim());
  }

  return `upi://pay?${params.toString()}`;
}
