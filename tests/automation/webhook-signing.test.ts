import { test } from "node:test";
import assert from "node:assert/strict";
import { signV1, verifyV1, SIGNATURE_VERSION } from "@/lib/automation/webhook-signing";

const SECRET = "test-secret-value";
const TS = "1700000000";
const EVENT = "11111111-1111-1111-1111-111111111111";
const BODY = JSON.stringify({ eventId: EVENT, status: "processed" });

test("signV1 is a stable v1=<hex> HMAC", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  assert.ok(sig.startsWith(`${SIGNATURE_VERSION}=`));
  assert.match(sig, /^v1=[0-9a-f]{64}$/);
  // Deterministic.
  assert.equal(sig, signV1(SECRET, TS, EVENT, BODY));
});

test("a fresh, correct signature verifies", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  assert.deepEqual(verifyV1(SECRET, sig, TS, EVENT, BODY, Number(TS)), { ok: true });
});

test("fails closed with no secret", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  assert.equal(verifyV1(undefined, sig, TS, EVENT, BODY, Number(TS)).reason, "no_secret");
});

test("tampered body is rejected", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  const r = verifyV1(SECRET, sig, TS, EVENT, BODY + " ", Number(TS));
  assert.ok(!r.ok);
  assert.equal(r.reason, "bad_signature");
});

test("swapped event id is rejected (id is bound into the signature)", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  const r = verifyV1(SECRET, sig, TS, "22222222-2222-2222-2222-222222222222", BODY, Number(TS));
  assert.equal(r.reason, "bad_signature");
});

test("clock skew beyond tolerance is stale", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  const r = verifyV1(SECRET, sig, TS, EVENT, BODY, Number(TS) + 301);
  assert.equal(r.reason, "stale");
});

test("within tolerance still verifies", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  assert.ok(verifyV1(SECRET, sig, TS, EVENT, BODY, Number(TS) + 299).ok);
});

test("missing headers are malformed", () => {
  assert.equal(verifyV1(SECRET, null, TS, EVENT, BODY).reason, "malformed");
  assert.equal(verifyV1(SECRET, "v1=abc", null, EVENT, BODY).reason, "malformed");
  assert.equal(verifyV1(SECRET, "v1=abc", TS, null, BODY).reason, "malformed");
  assert.equal(verifyV1(SECRET, "v1=abc", "not-a-number", EVENT, BODY).reason, "malformed");
});

test("wrong secret does not verify", () => {
  const sig = signV1(SECRET, TS, EVENT, BODY);
  assert.ok(!verifyV1("other-secret", sig, TS, EVENT, BODY, Number(TS)).ok);
});
