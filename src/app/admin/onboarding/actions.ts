"use server";

import { revalidatePath } from "next/cache";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { createOnboardingSession } from "@/lib/onboarding/sessions";
import { COMPANY } from "@/config/company";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface IssueResult {
  ok: boolean;
  message: string;
  /** The full onboarding URL including the one-time token. Shown once. */
  url?: string;
}

/**
 * Issue a fresh onboarding link. The raw token is returned here exactly once for
 * the admin to copy/share; it is never stored or logged (only its hash is
 * stored). Optional contract/client/project ids tie the submission to a record.
 */
export async function issueOnboardingLink(formData: FormData): Promise<IssueResult> {
  const session = await requireCapabilityAction("onboarding.manage", "onboarding.session_create");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const read = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v && UUID.test(v) ? v : null;
  };
  const contractId = read("contractId");
  const clientId = read("clientId");
  const projectId = read("projectId");

  const created = await createOnboardingSession({ contractId, clientId, projectId, actor });

  await recordAdminAction({
    actor,
    action: "onboarding.session_create",
    capability: "onboarding.manage",
    target: created ? { type: "onboarding_session", id: created.sessionId } : undefined,
    outcome: created ? "succeeded" : "failed",
    metadata: { contractId },
  });

  if (!created) return { ok: false, message: "Could not create an onboarding link." };

  revalidatePath("/admin/onboarding");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl;
  return {
    ok: true,
    message: "Link created. Copy it now — the token is shown only once.",
    url: `${origin}/onboard?token=${created.token}`,
  };
}
