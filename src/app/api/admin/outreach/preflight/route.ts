import { NextResponse } from "next/server";
import { verifyV1 } from "@/lib/automation/webhook-signing";
import { resolveWebhookSecret } from "@/lib/automation/dispatch";
import { evaluateOutreachEligibility } from "@/lib/outreach/eligibility";
import { requireCapabilityApi } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Outreach Preflight Gate API Endpoint
 * Verifies HMAC-SHA256 signature from n8n or an authenticated admin session,
 * executes synchronous deterministic eligibility evaluation, and persists decision audit log.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  const timestamp = request.headers.get("x-lit-timestamp");
  const eventId = request.headers.get("x-lit-event-id");
  const signature = request.headers.get("x-lit-signature");

  let isAuthorized = false;

  // 1. Authenticate via HMAC signature from n8n
  if (signature && timestamp && eventId) {
    const secret = await resolveWebhookSecret();
    const verification = verifyV1(secret, signature, timestamp, eventId, rawBody);
    if (verification.ok) {
      isAuthorized = true;
    }
  }

  // 2. Fallback: Authenticate via admin session capability
  if (!isAuthorized) {
    try {
      const capAuth = await requireCapabilityApi(request, "outreach.manage");
      if (capAuth.ok) {
        isAuthorized = true;
      }
    } catch {
      // Session auth failed
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing HMAC signature or admin session." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON body." },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email : undefined;
  const countryCode = typeof body.countryCode === "string" ? body.countryCode : undefined;
  const channel = (typeof body.channel === "string" ? body.channel : "email") as any;
  const recipientClass = (typeof body.recipientClass === "string" ? body.recipientClass : "corporate_subscriber") as any;
  const purpose = (typeof body.purpose === "string" ? body.purpose : "b2b_direct_marketing") as any;
  const category = (typeof body.category === "string" ? body.category : "marketing") as any;
  const campaignId = typeof body.campaignId === "string" ? body.campaignId : undefined;
  const contactId = typeof body.contactId === "string" ? body.contactId : undefined;
  const businessId = typeof body.businessId === "string" ? body.businessId : undefined;

  const decision = await evaluateOutreachEligibility({
    email,
    countryCode,
    channel,
    recipientClass,
    purpose,
    category,
    campaignId,
    contactId,
    businessId,
  });

  return NextResponse.json({
    ok: true,
    eligible: decision.eligible,
    state: decision.state,
    decision_id: decision.decision_id,
    policy_fingerprint: decision.policy_fingerprint,
    effective_rule_id: decision.effective_rule_id,
    effective_approval_id: decision.effective_approval_id,
    reason_codes: decision.reason_codes,
    requires_consent: decision.requires_consent ?? false,
    evaluated_at: decision.evaluated_at,
  });
}
