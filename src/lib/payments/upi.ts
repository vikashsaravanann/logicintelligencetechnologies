import QRCode from "qrcode";
import { z } from "zod";
import type { MobileIntentLink } from "./types";

/**
 * Lit Beneficiary & Payee Transparency Configuration.
 *
 * S VIKASH is the verified individual UPI account holder.
 * Logic Intelligence Technologies is the corporate brand / organization.
 */
export const LIT_PAYEE_CONFIG = {
  accountHolder: "S VIKASH",
  upiId: "9342877474@ptyes",
  brandName: "Logic Intelligence Technologies",
  supportEmail: "hello@logicintelligencetechnologies.in",
  city: "Coimbatore",
  state: "Tamil Nadu",
  country: "India",
  currency: "INR",
} as const;

export interface UpiPaymentParams {
  pa: string; // Payee VPA / UPI ID
  pn: string; // Payee Name
  am: number; // Exact amount in INR (positive, 2 decimals)
  cu?: string; // Currency, defaults to INR
  tr: string; // Unique Transaction Reference
  tn?: string; // Transaction Note
}

const upiParamsSchema = z.object({
  pa: z.string().trim().regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI VPA address"),
  pn: z.string().trim().min(1, "Payee name is required").max(100),
  am: z.number().finite().positive("Amount must be greater than zero"),
  cu: z.string().default("INR"),
  tr: z.string().trim().min(3).max(64),
  tn: z.string().trim().max(120).optional(),
});

/**
 * Validate raw UPI parameters using Zod schema.
 */
export function validateUpiParams(raw: unknown): UpiPaymentParams {
  const result = upiParamsSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid UPI payment parameters: ${result.error.issues.map((i) => i.message).join(", ")}`);
  }
  return result.data;
}

/**
 * Build standards-compatible dynamic UPI URI with strict percent encoding.
 * Example:
 * upi://pay?pa=9342877474@ptyes&pn=S%20VIKASH&am=59000.00&cu=INR&tr=LIT-PAY-2026-X8F9C2&tn=Milestone%20Deposit
 */
export function buildUpiUri(params: UpiPaymentParams): string {
  const validated = validateUpiParams(params);
  const formattedAmount = validated.am.toFixed(2);
  const currency = validated.cu || "INR";

  const searchParams = new URLSearchParams();
  searchParams.set("pa", validated.pa);
  searchParams.set("pn", validated.pn);
  searchParams.set("am", formattedAmount);
  searchParams.set("cu", currency);
  searchParams.set("tr", validated.tr);

  if (validated.tn) {
    searchParams.set("tn", validated.tn);
  }

  return `upi://pay?${searchParams.toString()}`;
}

/**
 * Generate amount-specific QR Code as a base64 PNG data URL.
 */
export async function generateUpiQrDataUrl(
  upiUri: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  if (!upiUri || !upiUri.startsWith("upi://pay")) {
    throw new Error("Invalid UPI URI passed to QR generator");
  }

  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: "M",
    margin: 3,
    width: 380,
    color: {
      dark: "#0B2545", // LIT Navy brand color for clean scanning contrast
      light: "#FFFFFF",
    },
    ...options,
  };

  return await QRCode.toDataURL(upiUri, defaultOptions);
}

/**
 * Generate amount-specific QR Code as an SVG string.
 */
export async function generateUpiQrSvg(upiUri: string): Promise<string> {
  if (!upiUri || !upiUri.startsWith("upi://pay")) {
    throw new Error("Invalid UPI URI passed to QR generator");
  }

  return await QRCode.toString(upiUri, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 3,
    color: {
      dark: "#0B2545",
      light: "#FFFFFF",
    },
  });
}

/**
 * Generate mobile deep-link intent links for major UPI apps in India.
 * Android and iOS support deep-linking via these canonical schemes.
 */
export function getMobileIntentLinks(upiUri: string): MobileIntentLink[] {
  if (!upiUri || !upiUri.startsWith("upi://pay?")) {
    return [];
  }

  const queryString = upiUri.slice("upi://pay?".length);

  return [
    {
      appId: "gpay",
      appName: "Google Pay",
      url: `gpay://upi/pay?${queryString}`,
      colorScheme: {
        bg: "bg-[#FFFFFF]",
        text: "text-[#3C4043]",
        border: "border-[#DADCE0]",
      },
    },
    {
      appId: "phonepe",
      appName: "PhonePe",
      url: `phonepe://pay?${queryString}`,
      colorScheme: {
        bg: "bg-[#5F259F]",
        text: "text-[#FFFFFF]",
        border: "border-[#5F259F]",
      },
    },
    {
      appId: "paytm",
      appName: "Paytm",
      url: `paytmmp://pay?${queryString}`,
      colorScheme: {
        bg: "bg-[#002E6E]",
        text: "text-[#FFFFFF]",
        border: "border-[#002E6E]",
      },
    },
    {
      appId: "bhim",
      appName: "BHIM UPI",
      url: `bhim://pay?${queryString}`,
      colorScheme: {
        bg: "bg-[#00796B]",
        text: "text-[#FFFFFF]",
        border: "border-[#00796B]",
      },
    },
    {
      appId: "generic",
      appName: "Any UPI App",
      url: upiUri,
      colorScheme: {
        bg: "bg-[#1565C0]",
        text: "text-[#FFFFFF]",
        border: "border-[#1565C0]",
      },
    },
  ];
}

/**
 * Validate Indian 12-digit UPI UTR (Unique Transaction Reference) / Ref.
 * Standard UPI UTRs are exactly 12 numeric digits.
 * Also accommodates valid 10-18 alphanumeric bank payment references.
 */
export function isValidUtr(utr: string): boolean {
  if (typeof utr !== "string") return false;
  const trimmed = utr.trim();
  // Standard Indian 12-digit UPI UTR:
  if (/^\d{12}$/.test(trimmed)) return true;
  // Fallback for NEFT / IMPS reference numbers:
  if (/^[A-Za-z0-9]{10,22}$/.test(trimmed)) return true;
  return false;
}

/**
 * Indian GSTIN validator (15-character alphanumeric format).
 * Structure: 2-digit state code + 10-character PAN + 1-digit entity code + 'Z' + 1 checksum character.
 */
export function isValidGstin(gstin: string): boolean {
  if (typeof gstin !== "string") return false;
  const trimmed = gstin.trim().toUpperCase();
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(trimmed);
}

/**
 * Format currency amount in Indian Rupee format.
 * Example: 59000 -> ₹59,000.00
 */
export function formatInr(amount: number): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "₹0.00";
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculate GST based on subtotal and place of supply.
 * LIT is registered in Tamil Nadu (State code 33).
 * Intra-state (Tamil Nadu) -> 9% CGST + 9% SGST.
 * Inter-state (Other states/UTs) -> 18% IGST.
 */
export function calculateGst(
  subtotal: number,
  placeOfSupplyState = "Tamil Nadu",
  gstRate = 0.18
) {
  const isIntraState =
    placeOfSupplyState.trim().toLowerCase() === "tamil nadu" ||
    placeOfSupplyState.trim().toLowerCase() === "tn";

  const totalGst = Math.round(subtotal * gstRate * 100) / 100;
  const totalAmount = Math.round((subtotal + totalGst) * 100) / 100;

  if (isIntraState) {
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst - cgst) * 100) / 100;
    return {
      subtotal,
      gstRate,
      gstAmount: totalGst,
      cgst,
      sgst,
      igst: 0,
      totalAmount,
      isInterState: false,
    };
  } else {
    return {
      subtotal,
      gstRate,
      gstAmount: totalGst,
      cgst: 0,
      sgst: 0,
      igst: totalGst,
      totalAmount,
      isInterState: true,
    };
  }
}
