import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordAdminAction, type StaffActor } from "@/lib/admin/audit";
import { generateOnboardingToken, hashToken, sessionState, type SessionState } from "./token-core";

const MAX_TTL_DAYS = 30;

export interface CreateSessionInput {
  clientId?: string | null;
  projectId?: string | null;
  contractId?: string | null;
  ttlDays?: number;
  actor: StaffActor;
}

export interface CreatedSession {
  sessionId: string;
  /** The raw token — returned ONCE, never stored or logged. */
  token: string;
}

/**
 * Create an onboarding session and return its raw token exactly once. Only the
 * SHA-256 hash is stored. The token must be delivered to the client over the
 * link and never written to logs. Callers are responsible for recording the
 * audit entry at their boundary (admin action audit, or a provisioning step in
 * the automated pipeline), since this helper is used from both contexts.
 */
export async function createOnboardingSession(input: CreateSessionInput): Promise<CreatedSession | null> {
  const ttl = Math.min(Math.max(1, input.ttlDays ?? 14), MAX_TTL_DAYS);
  const { token, tokenHash } = generateOnboardingToken();
  const expiresAt = new Date(Date.now() + ttl * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("onboarding_sessions")
    .insert({
      token_hash: tokenHash,
      client_id: input.clientId ?? null,
      project_id: input.projectId ?? null,
      contract_id: input.contractId ?? null,
      expires_at: expiresAt,
      created_by: input.actor.userId,
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return { sessionId: data.id as string, token };
}

/** Resolve a raw token to its stored session state (no mutation). */
export async function stateForToken(rawToken: string): Promise<SessionState> {
  const { data } = await supabaseAdmin
    .from("onboarding_sessions")
    .select("revoked_at, consumed_at, expires_at")
    .eq("token_hash", hashToken(rawToken))
    .maybeSingle();
  return sessionState(data);
}

/** Revoke a session so its link stops working. Audited. */
export async function revokeSession(sessionId: string, actor: StaffActor): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("onboarding_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", sessionId)
    .is("consumed_at", null);
  await recordAdminAction({
    actor,
    action: "onboarding.session_revoke",
    capability: "onboarding.manage",
    target: { type: "onboarding_session", id: sessionId },
    outcome: error ? "failed" : "succeeded",
    errorCode: error?.code,
  });
  return !error;
}

/**
 * Rotate the onboarding link for a contract: revoke any active session and mint
 * a fresh one. Used by the failure queue's "Rotate onboarding link".
 */
export async function rotateForContract(
  contractId: string,
  refs: { clientId?: string | null; projectId?: string | null },
  actor: StaffActor,
): Promise<CreatedSession | null> {
  await supabaseAdmin
    .from("onboarding_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("contract_id", contractId)
    .is("revoked_at", null)
    .is("consumed_at", null);
  return createOnboardingSession({ contractId, clientId: refs.clientId, projectId: refs.projectId, actor });
}
