import "server-only";
import { requireVerifiedUser } from "@/lib/auth/require-user";
import { rateLimit } from "./rate-limit";

export const AI_MAX_OUTPUT_TOKENS = 1200;
export const AI_MAX_BODY_BYTES = 96 * 1024;

export async function guardAiRequest() {
  const user = await requireVerifiedUser();
  if (!user) return { ok: false as const, status: 401, error: "Sign in with a verified account to use AI" };
  // Shared across all three endpoints: swapping endpoints cannot reset limits.
  if (!(await rateLimit(`ai:user:${user.id}:minute`, 6, 60_000)) ||
      !(await rateLimit(`ai:user:${user.id}:day`, 60, 24 * 60 * 60_000)) ||
      !(await rateLimit("ai:global:day", 1000, 24 * 60 * 60_000))) {
    return { ok: false as const, status: 429, error: "AI request limit reached or service unavailable" };
  }
  return { ok: true as const, user };
}

export class InvalidAiRequest extends Error {}

/** Enforce bytes while reading, including chunked requests without Content-Length. */
export async function readBoundedAiJson(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > AI_MAX_BODY_BYTES) throw new InvalidAiRequest("Request too large");
  if (!request.body) throw new InvalidAiRequest("Missing body");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > AI_MAX_BODY_BYTES) {
        await reader.cancel();
        throw new InvalidAiRequest("Request too large");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    try { return JSON.parse(text); } catch { throw new InvalidAiRequest("Invalid JSON"); }
  } finally {
    reader.releaseLock();
  }
}