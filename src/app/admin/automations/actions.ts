"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { rotateForContract } from "@/lib/onboarding/sessions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Re-queue a failed provisioning step so the dispatcher picks it up again. Only
 * steps currently in 'failed' are reset to 'pending'.
 */
export async function retryProvisioningStep(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("automations.retry", "automation.retry");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const stepId = String(formData.get("stepId") ?? "");
  if (!UUID.test(stepId)) throw new Error("Invalid step id");

  const { error } = await supabaseAdmin
    .from("provisioning_steps")
    .update({ status: "pending" })
    .eq("id", stepId)
    .eq("status", "failed");

  await recordAdminAction({
    actor,
    action: "automation.retry",
    capability: "automations.retry",
    target: { type: "provisioning_step", id: stepId },
    outcome: error ? "failed" : "succeeded",
    errorCode: error?.code,
  });

  if (error) throw new Error("Could not retry the provisioning step.");

  revalidatePath("/admin/automations");
}

/**
 * Rotate the onboarding link for a contract: revoke any active session and mint
 * a fresh one. rotateForContract records its own audit entry.
 */
export async function rotateOnboardingLink(formData: FormData): Promise<void> {
  const session = await requireCapabilityAction("onboarding.manage", "onboarding.rotate_link");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const contractId = String(formData.get("contractId") ?? "");
  if (!UUID.test(contractId)) throw new Error("Invalid contract id");

  // Recover the client/project references from an existing session for the contract.
  const { data } = await supabaseAdmin
    .from("onboarding_sessions")
    .select("client_id, project_id")
    .eq("contract_id", contractId)
    .limit(1)
    .maybeSingle();

  const clientId = (data?.client_id as string | null | undefined) ?? null;
  const projectId = (data?.project_id as string | null | undefined) ?? null;

  await rotateForContract(contractId, { clientId, projectId }, actor);

  revalidatePath("/admin/automations");
}
