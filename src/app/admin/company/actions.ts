"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { GSTIN_REGEX, PAN_REGEX, DEFAULT_COMPANY_CREDENTIALS } from "@/lib/payments/calculations";

export interface SaveTaxIdentifiersResult {
  ok: boolean;
  message?: string;
  error?: string;
}

/**
 * Super Admin action to update Company GSTIN and PAN identifiers.
 * Protected by "payment.verify" capability and explicit super_admin role check.
 */
export async function saveCompanyTaxIdentifiersAction(
  formData: FormData
): Promise<SaveTaxIdentifiersResult> {
  const session = await requireCapabilityAction("payment.verify", "company.update_tax_identifiers");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  // Only super_admin is authorized to mutate company tax credentials
  if (session.role !== "super_admin") {
    await recordAdminAction({
      actor,
      action: "company.update_tax_identifiers",
      capability: "payment.verify",
      target: { type: "company_credentials", id: "global" },
      outcome: "denied",
      metadata: { reason: "Actor lacks super_admin role" },
      errorCode: "42501",
    });
    return { ok: false, error: "Only Super Administrators can update company tax credentials." };
  }

  const rawGstin = String(formData.get("gstin") ?? "").trim().toUpperCase();
  const rawPan = String(formData.get("pan") ?? "").trim().toUpperCase();

  const gstin = rawGstin.length > 0 ? rawGstin : null;
  const pan = rawPan.length > 0 ? rawPan : null;

  // Validation
  if (gstin && !GSTIN_REGEX.test(gstin)) {
    return {
      ok: false,
      error: "Invalid GSTIN format. Expected 15 characters (e.g. 33AAAAA0000A1Z5).",
    };
  }

  if (pan && !PAN_REGEX.test(pan)) {
    return {
      ok: false,
      error: "Invalid PAN format. Expected 10 characters (e.g. ABCDE1234F).",
    };
  }

  // Cross-validation: GSTIN chars 3-12 must match PAN if both provided
  if (gstin && pan && gstin.substring(2, 12) !== pan) {
    return {
      ok: false,
      error: "The PAN does not match the PAN embedded within the GSTIN (characters 3-12).",
    };
  }

  try {
    // Check if company_credentials record exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("company_credentials")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[saveCompanyTaxIdentifiersAction] Fetch error:", fetchError);
    }

    let targetId = existing?.id;

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from("company_credentials")
        .update({
          gstin,
          pan,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("company_credentials")
        .insert({
          enterprise_name: DEFAULT_COMPANY_CREDENTIALS.enterprise_name,
          msme_udyam_number: DEFAULT_COMPANY_CREDENTIALS.msme_udyam_number,
          msme_category: DEFAULT_COMPANY_CREDENTIALS.msme_category,
          major_activity: DEFAULT_COMPANY_CREDENTIALS.major_activity,
          registered_address: DEFAULT_COMPANY_CREDENTIALS.registered_address,
          official_email: DEFAULT_COMPANY_CREDENTIALS.official_email,
          official_website: DEFAULT_COMPANY_CREDENTIALS.official_website,
          gstin,
          pan,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }
      targetId = inserted?.id;
    }

    // Record audit trail
    await recordAdminAction({
      actor,
      action: "company.update_tax_identifiers",
      capability: "payment.verify",
      target: { type: "company_credentials", id: targetId ?? "global" },
      outcome: "succeeded",
      metadata: {
        gstin_configured: Boolean(gstin),
        pan_configured: Boolean(pan),
        masked_gstin: gstin ? `${gstin.slice(0, 4)}...${gstin.slice(-3)}` : null,
      },
    });

    revalidatePath("/admin/company");
    return {
      ok: true,
      message: "Company tax identifiers (GSTIN & PAN) updated successfully.",
    };
  } catch (err: any) {
    console.error("[saveCompanyTaxIdentifiersAction] Error updating credentials:", err);
    await recordAdminAction({
      actor,
      action: "company.update_tax_identifiers",
      capability: "payment.verify",
      target: { type: "company_credentials", id: "global" },
      outcome: "failed",
      errorCode: "db_error",
      metadata: { error: err.message },
    });
    return {
      ok: false,
      error: err.message || "Failed to update company tax identifiers in the database.",
    };
  }
}
