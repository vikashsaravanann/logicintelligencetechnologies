import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashToken,
  isWellFormedToken,
  generateOnboardingToken,
  sessionState,
} from "@/lib/onboarding/token-core";

test("hashToken matches the known SHA-256 vector for 'abc'", () => {
  assert.equal(
    hashToken("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("generated tokens are well formed and hash deterministically", () => {
  for (let i = 0; i < 50; i++) {
    const { token, tokenHash } = generateOnboardingToken();
    assert.ok(isWellFormedToken(token), `token not well formed: ${token}`);
    assert.equal(tokenHash, hashToken(token));
    assert.match(tokenHash, /^[0-9a-f]{64}$/);
  }
});

test("generated tokens are unique", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 200; i++) seen.add(generateOnboardingToken().token);
  assert.equal(seen.size, 200);
});

test("isWellFormedToken rejects wrong length / illegal chars", () => {
  assert.ok(!isWellFormedToken("short"));
  assert.ok(!isWellFormedToken("a".repeat(42)));
  assert.ok(!isWellFormedToken("a".repeat(44)));
  assert.ok(!isWellFormedToken("+".repeat(43))); // + and / are not base64url
  assert.ok(!isWellFormedToken("a/b".padEnd(43, "a")));
  assert.ok(isWellFormedToken("a".repeat(43)));
  assert.ok(isWellFormedToken("A9_-".padEnd(43, "x")));
});

test("sessionState derives state from row timestamps", () => {
  const now = new Date("2026-01-10T00:00:00Z");
  assert.equal(sessionState(null, now), "invalid");
  assert.equal(sessionState({}, now), "valid");
  assert.equal(
    sessionState({ expires_at: "2026-01-20T00:00:00Z" }, now),
    "valid",
  );
  assert.equal(
    sessionState({ expires_at: "2026-01-01T00:00:00Z" }, now),
    "expired",
  );
  assert.equal(
    sessionState({ consumed_at: "2026-01-05T00:00:00Z" }, now),
    "consumed",
  );
  assert.equal(
    sessionState({ revoked_at: "2026-01-05T00:00:00Z" }, now),
    "revoked",
  );
  // Precedence: revoked beats consumed beats expired.
  assert.equal(
    sessionState(
      {
        revoked_at: "2026-01-05T00:00:00Z",
        consumed_at: "2026-01-05T00:00:00Z",
        expires_at: "2026-01-01T00:00:00Z",
      },
      now,
    ),
    "revoked",
  );
});
