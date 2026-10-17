"use server";

import { revalidatePath } from "next/cache";
import { submitBillingDetails, recordPaymentAttempt } from "@/lib/payments/db";
import { isValidGstin, isValidPan } from "@/lib/payments/calculations";
import { isValidUtr } from "@/lib/payments/upi";
import type { CustomerType } from "@/types/payments";

export interface BillingFormActionState {
  success: boolean;
  error?: string | null;
  errors?: Record<string, string>;
}

export interface PaymentAttemptActionState {
  success: boolean;
  error?: string | null;
  errors?: Record<string, string>;
}

/**
 * Server Action: Submit client billing details (Form-First Gate).
 * Advances payment request to 'ready_to_pay' and dynamically unlocks UPI QR code.
 */
export async function submitBillingFormAction(
  prevState: BillingFormActionState | null,
  formData: FormData
): Promise<BillingFormActionState> {
  const paymentRequestId = formData.get("paymentRequestId") as string;
  const token = formData.get("token") as string;
  const customerType = (formData.get("customerType") as CustomerType) || "individual";
  const legalName = (formData.get("legalName") as string)?.trim();
  const companyName = (formData.get("companyName") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const addressLine1 = (formData.get("addressLine1") as string)?.trim();
  const addressLine2 = (formData.get("addressLine2") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim();
  const state = (formData.get("state") as string)?.trim();
  const postalCode = (formData.get("postalCode") as string)?.trim();
  const placeOfSupply = (formData.get("placeOfSupply") as string)?.trim() || "Tamil Nadu - 33";
  const clientGstin = (formData.get("clientGstin") as string)?.trim() || null;
  const pan = (formData.get("pan") as string)?.trim() || null;

  const errors: Record<string, string> = {};

  if (!paymentRequestId) {
    return { success: false, error: "Payment request ID is required." };
  }

  if (customerType !== "individual" && customerType !== "company") {
    errors.customerType = "Please select customer classification.";
  }

  if (!legalName || legalName.length < 2) {
    errors.legalName = "Full legal name must be at least 2 characters.";
  }

  if (customerType === "company" && (!companyName || companyName.length < 2)) {
    errors.companyName = "Company/Legal Entity name is required for business invoicing.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Valid billing email is required.";
  }

  const digitsOnlyPhone = (phone || "").replace(/\D/g, "");
  if (!digitsOnlyPhone || digitsOnlyPhone.length < 10) {
    errors.phone = "Valid 10-digit contact phone number is required.";
  }

  if (!addressLine1 || addressLine1.length < 4) {
    errors.addressLine1 = "Registered billing address is required.";
  }

  if (!city || city.length < 2) {
    errors.city = "City is required.";
  }

  if (!state || state.length < 2) {
    errors.state = "State is required.";
  }

  const cleanPin = (postalCode || "").replace(/\s/g, "");
  if (!cleanPin || !/^\d{6}$/.test(cleanPin)) {
    errors.postalCode = "Valid 6-digit PIN code is required.";
  }

  if (clientGstin) {
    const formattedGstin = clientGstin.toUpperCase();
    if (!isValidGstin(formattedGstin)) {
      errors.clientGstin = "Invalid GSTIN format (15 alphanumeric characters required).";
    }
  }

  if (pan) {
    const formattedPan = pan.toUpperCase();
    if (!isValidPan(formattedPan)) {
      errors.pan = "Invalid PAN format (10 characters, e.g. ABCDE1234F).";
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      error: "Please correct the highlighted errors in the billing form.",
      errors,
    };
  }

  try {
    await submitBillingDetails({
      paymentRequestId,
      secureToken: token,
      customerType,
      legalName,
      companyName: customerType === "company" ? companyName : null,
      email,
      phone: digitsOnlyPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode: cleanPin,
      country: "India",
      clientGstin: clientGstin ? clientGstin.toUpperCase() : null,
      placeOfSupply,
    });

    if (token) {
      revalidatePath(`/payment/${token}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("[submitBillingFormAction] error:", err);
    return {
      success: false,
      error: err.message || "Failed to record billing details. Please try again.",
    };
  }
}

/**
 * Server Action: Submit client 12-digit UPI UTR for verification.
 * Transitions payment request status to 'payment_reported' / 'under_review'.
 */
export async function submitPaymentAttemptAction(
  prevState: PaymentAttemptActionState | null,
  formData: FormData
): Promise<PaymentAttemptActionState> {
  const paymentRequestId = formData.get("paymentRequestId") as string;
  const token = formData.get("token") as string;
  const utr = (formData.get("utr") as string)?.trim();
  const payerUpiId = (formData.get("payerUpiId") as string)?.trim() || null;
  const payerBankName = (formData.get("payerBankName") as string)?.trim() || null;
  const reportedAmountPaise = Number(formData.get("reportedAmountPaise") || 0);
  const notes = (formData.get("notes") as string)?.trim() || null;
  const confirmation = formData.get("confirmation") === "on" || formData.get("confirmation") === "true";

  const errors: Record<string, string> = {};

  if (!paymentRequestId) {
    return { success: false, error: "Payment request ID is required." };
  }

  if (!utr) {
    errors.utr = "12-digit UPI UTR / Transaction Reference is required.";
  } else if (!isValidUtr(utr)) {
    errors.utr = "Please enter a valid 12-digit numeric UPI transaction reference (UTR).";
  }

  if (!confirmation) {
    errors.confirmation = "Please confirm that you have completed this UPI transfer.";
  }

  if (reportedAmountPaise <= 0) {
    return { success: false, error: "Reported payment amount must be greater than zero." };
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      error: "Please review the transaction submission fields.",
      errors,
    };
  }

  try {
    await recordPaymentAttempt({
      paymentRequestId,
      secureToken: token,
      utr,
      payerUpiId,
      payerBankName,
      reportedAmountPaise,
      notes,
    });

    if (token) {
      revalidatePath(`/payment/${token}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("[submitPaymentAttemptAction] error:", err);
    return {
      success: false,
      error: err.message || "Failed to submit transaction reference for verification.",
    };
  }
}
