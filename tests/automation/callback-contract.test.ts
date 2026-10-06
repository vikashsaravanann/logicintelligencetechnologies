import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const SRC = fs.readFileSync(
  path.join(process.cwd(), "src/app/api/automation/callback/route.ts"),
  "utf8",
);

test("signature is verified BEFORE the body is parsed", () => {
  const verifyAt = SRC.indexOf("verifyV1(");
  const parseAt = SRC.search(/callbackSchema\.parse\(|JSON\.parse\(/);
  assert.ok(verifyAt > -1, "verifyV1 must be called");
  assert.ok(parseAt > -1, "body must be parsed");
  assert.ok(verifyAt < parseAt, "verifyV1 must run before parsing the body");
});

test("verification failure returns 401 and does not leak the reason", () => {
  assert.match(SRC, /status:\s*401/);
  assert.ok(!/reason/.test(SRC.split("verifyV1")[1]?.split("}")[0] ?? ""), "must not branch on the verify reason in the response");
});

test("the signed event id is matched against the body", () => {
  assert.match(SRC, /x-lit-event-id/);
  assert.match(SRC, /!==\s*body\.eventId|body\.eventId\s*!==/);
});

test("the body is size-bounded before being read", () => {
  assert.match(SRC, /content-length/);
  assert.match(SRC, /MAX_BODY/);
  assert.match(SRC, /413/);
});

test("the update is idempotent (terminal events are not re-applied)", () => {
  assert.match(SRC, /idempotent/);
  assert.match(SRC, /\.in\(\s*"status"\s*,\s*\[\s*"pending"\s*,\s*"dispatched"\s*\]\s*\)/);
});

test("callback is rate limited", () => {
  assert.match(SRC, /rateLimit\(/);
});
