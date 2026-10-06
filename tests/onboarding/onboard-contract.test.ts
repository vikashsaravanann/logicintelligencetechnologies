import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), "utf8");

const ACTIONS = read("src/app/onboard/actions.ts");
const PAGE = read("src/app/onboard/page.tsx");

test("the raw token is never logged", () => {
  // No console.* call anywhere in the submit path mentions the token.
  assert.ok(!/console\.\w+\([^)]*token/i.test(ACTIONS), "token must never be logged");
  assert.ok(!/console\.\w+\([^)]*token/i.test(PAGE), "token must never be logged on the page");
});

test("submit is rate limited before any work", () => {
  const rl = ACTIONS.indexOf("rateLimit(");
  const rpc = ACTIONS.indexOf("consume_onboarding_session");
  assert.ok(rl > -1 && rpc > -1);
  assert.ok(rl < rpc, "rate limit must precede the consume RPC");
});

test("secret scan runs BEFORE the consume RPC", () => {
  const scan = ACTIONS.indexOf("findSecretLikeValues(");
  const rpc = ACTIONS.indexOf("consume_onboarding_session");
  assert.ok(scan > -1 && rpc > -1);
  assert.ok(scan < rpc, "secret scan must run before the token is consumed");
});

test("token format is checked and the body size bounded before the RPC", () => {
  const wf = ACTIONS.indexOf("isWellFormedToken(");
  const size = ACTIONS.indexOf("MAX_INTAKE_BYTES");
  const rpc = ACTIONS.indexOf("consume_onboarding_session");
  assert.ok(wf > -1 && wf < rpc, "token well-formedness must be checked first");
  assert.ok(size > -1 && size < rpc, "payload size must be bounded before the RPC");
});

test("only the token hash reaches the database, never the raw token", () => {
  assert.match(ACTIONS, /hashToken\(token\)/);
  assert.ok(!/p_token_hash:\s*token\b/.test(ACTIONS), "must pass the hash, not the raw token");
});

test("the onboarding page is noindex and no-referrer", () => {
  assert.match(PAGE, /index:\s*false/);
  assert.match(PAGE, /no-referrer/);
});

test("invalid/expired/revoked collapse to one generic message", () => {
  assert.match(ACTIONS, /no longer valid/);
});
