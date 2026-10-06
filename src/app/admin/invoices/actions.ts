"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Mark a Pending/Overdue invoice Paid. Idempotent; audited. */
export async function markInvoicePaid(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("invoices.write", "invoice.mark_paid");
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid invoice id");

  const { error } = await supabaseAdmin
    .from("invoices")
    .update({ status: "Paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["Pending", "Overdue"]);

  await recordAdminAction({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "invoice.mark_paid",
    capability: "invoices.write",
    target: { type: "invoice", id },
    outcome: error ? "failed" : "succeeded",
    errorCode: error ? "db_update_failed" : undefined,
  });

  if (error) throw new Error("Could not update the invoice.");
  revalidatePath("/admin/invoices");
}
