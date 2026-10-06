import test from "node:test";
import assert from "node:assert/strict";
import { redactMetadata, isValidActionName } from "../../src/lib/admin/audit-core.ts";

test("valid/invalid action names", () => {
  assert.ok(isValidActionName("support.ticket.resolve"));
  assert.ok(isValidActionName("proposal.create"));
  assert.ok(!isValidActionName("NotDotted"));
  assert.ok(!isValidActionName("has space.x"));
});

test("redacts secret-like keys", () => {
  const out = redactMetadata({ password: "hunter2", api_key: "sk_live_x", authToken: "t", normal: "ok" });
  assert.equal(out.password, "[redacted]");
  assert.equal(out.api_key, "[redacted]");
  assert.equal(out.authToken, "[redacted]");
  assert.equal(out.normal, "ok");
});

test("truncates long strings and caps size", () => {
  const out = redactMetadata({ big: "x".repeat(5000) });
  assert.ok(String(out.big).length <= 520);
  const many: Record<string, string> = {};
  for (let i = 0; i < 2000; i++) many["k" + i] = "value".repeat(20);
  const capped = redactMetadata(many);
  assert.ok(JSON.stringify(capped).length <= 8192);
});

test("non-object input is wrapped", () => {
  assert.deepEqual(redactMetadata("hello"), { value: "hello" });
  assert.deepEqual(redactMetadata(null), { value: null });
});

test("handles circular references", () => {
  const a: Record<string, unknown> = { name: "x" };
  a.self = a;
  const out = redactMetadata(a);
  assert.equal(out.name, "x");
});
