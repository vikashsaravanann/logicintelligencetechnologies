"use server";

import { headers } from "next/headers";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashToken, isWellFormedToken } from "@/lib/onboarding/token-core";
import { intakeSchema, MAX_INTAKE_BYTES } from "@/lib/onboarding/intake-schema";
import { findSecretLikeValues } from "@/lib/onboarding/secret-scan";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";

export interface SubmitResult {
  ok: boolean;
  message: string;
}

function hashIp(ip: string): string | null {
  const secret = process.env.AUDIT_HASH_SECRET;
  if (!secret || !ip || ip === "unknown") return null;
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

/**
 * Consume an onboarding link and record the intake. Rate limited; validates and
 * secret-scans the payload before it is ever stored; refuses anything that
 * looks like a credential. Invalid/expired/consumed tokens get the same generic
 * message so the link cannot be probed.
 */
export async function submitOnboarding(token: string, intakeRaw: unknown): Promise<SubmitResult> {
  const h = await headers();
  const ip = clientIp({ headers: h } as unknown as Request);

  if (!(await rateLimit(`onboard-submit:${ip}`, 10, 60_000))) {
    return { ok: false, message: "Too many attempts. Please wait a moment and try again." };
  }
  if (typeof token !== "string" || !isWellFormedToken(token)) {
    return { ok: false, message: "This onboarding link is not valid." };
  }

  // Size bound before anything else.
  let serialized: string;
  try {
    serialized = JSON.stringify(intakeRaw ?? {});
  } catch {
    return { ok: false, message: "We could not read that submission." };
  }
  if (serialized.length > MAX_INTAKE_BYTES) {
    return { ok: false, message: "That submission is too large." };
  }

  const parsed = intakeSchema.safeParse(intakeRaw);
  if (!parsed.success) {
    return { ok: false, message: "Please complete all required fields correctly." };
  }

  // Never store anything that looks like a secret.
  if (findSecretLikeValues(parsed.data).length > 0) {
    return {
      ok: false,
      message:
        "It looks like your answers contain a password or API key. Please remove any credentials — we never collect them here — and submit again.",
    };
  }

  const { data, error } = await supabaseAdmin.rpc("consume_onboarding_session", {
    p_token_hash: hashToken(token),
    p_intake: parsed.data,
    p_ip_hash: hashIp(ip),
  });

  if (error) {
    return { ok: false, message: "Something went wrong. Please try again shortly." };
  }
  const res = (data ?? {}) as { ok?: boolean; reason?: string };
  if (!res.ok) {
    // expired / consumed / revoked / invalid all map to one generic message.
    return { ok: false, message: "This onboarding link is no longer valid. Please contact us for a new one." };
  }

  return { ok: true, message: "Thank you — your onboarding details have been received." };
}
