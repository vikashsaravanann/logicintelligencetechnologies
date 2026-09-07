"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Persist profile fields that exist on public.profiles.
 * Email lives on auth.users — never write email here.
 */
export async function updateProfile(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated. Please sign in again.",
      };
    }

    const fullName = String(formData.get("fullName") || "").trim();
    const companyName = String(formData.get("companyName") || "").trim();
    const phoneNumber = String(formData.get("phoneNumber") || "").trim();

    if (!fullName) {
      return { success: false, error: "Full name is required." };
    }

    const { supabaseAdmin } = await import("@/lib/supabase/admin");

    // Prefer update; insert if row missing
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    let error;
    if (existing?.id) {
      const res = await supabaseAdmin
        .from("profiles")
        .update({
          full_name: fullName,
          company_name: companyName || null,
          phone_number: phoneNumber || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      error = res.error;
    } else {
      const res = await supabaseAdmin.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        company_name: companyName || null,
        phone_number: phoneNumber || null,
      });
      error = res.error;
    }

    if (error) {
      console.error("[profile] save failed:", error);
      return { success: false, error: error.message };
    }

    try {
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
    } catch (metaErr) {
      console.warn("[profile] auth metadata update skipped:", metaErr);
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err: unknown) {
    console.error("[profile] unexpected:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}
