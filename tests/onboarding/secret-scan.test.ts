import { test } from "node:test";
import assert from "node:assert/strict";
import { findSecretLikeValues, containsSecretLikeValue } from "@/lib/onboarding/secret-scan";

// Representative values per pattern. These are fabricated, not real secrets.
const POSITIVES: Array<[string, string]> = [
  ["private_key", "-----BEGIN RSA PRIVATE KEY-----\nMIIabc\n-----END RSA PRIVATE KEY-----"],
  ["stripe_key", "sk_live_abcdefghijklmnop0123"],
  ["openai_key", "sk-abcdefghijklmnopqrstuvwxyz0123"],
  ["github_token", "ghp_abcdefghijklmnopqrstuvwxyz0123"],
  ["aws_access_key", "AKIAIOSFODNN7EXAMPLE"],
  ["google_api_key", "AIza" + "a".repeat(35)],
  ["slack_token", "xoxb-abcdefghij-klmnop"],
  ["jwt", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghij"],
  ["credential_assignment", "password: hunter2secret"],
  ["credential_assignment", "api_key = abcdef123456"],
];

for (const [kind, value] of POSITIVES) {
  test(`detects ${kind}`, () => {
    const findings = findSecretLikeValues({ notes: value });
    assert.ok(findings.length >= 1, `expected a finding for ${kind}`);
    assert.ok(findings.some((f) => f.kind === kind), `expected kind ${kind}, got ${findings.map((f) => f.kind)}`);
  });
}

test("does not flag ordinary prose", () => {
  const safe = {
    company: { legalName: "Acme Logistics" },
    project: { goals: "We want a password reset flow and better secret handling guidance." },
    access: { notes: "Our hosting provider is a well-known cloud. No credentials here." },
  };
  assert.deepEqual(findSecretLikeValues(safe), []);
  assert.equal(containsSecretLikeValue(safe), false);
});

test("reports the path but never the value", () => {
  const findings = findSecretLikeValues({ a: { b: { c: "sk_live_abcdefghijklmnop0123" } } });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].path, "a.b.c");
  // The finding object must carry only path + kind.
  assert.deepEqual(Object.keys(findings[0]).sort(), ["kind", "path"]);
  assert.ok(!JSON.stringify(findings).includes("sk_live"));
});

test("walks arrays and bounds depth", () => {
  const findings = findSecretLikeValues({ urls: ["https://ok.example", "ghp_abcdefghijklmnopqrstuvwxyz0123"] });
  assert.ok(findings.some((f) => f.path === "urls.1"));
});

test("handles cyclic input without throwing", () => {
  const o: Record<string, unknown> = { x: 1 };
  o.self = o;
  assert.doesNotThrow(() => findSecretLikeValues(o));
});
