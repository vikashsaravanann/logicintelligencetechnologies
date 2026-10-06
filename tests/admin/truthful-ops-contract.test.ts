import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

test("invoice route is capability-guarded, uses next_reference, writes Pending (not lowercase)", () => {
  const src = read("src/app/api/admin/invoices/route.ts");
  assert.match(src, /requireCapabilityApi\(\s*req\s*,\s*"invoices\.write"\)/);
  assert.match(src, /next_reference/);
  assert.match(src, /status:\s*"Pending"/);
  assert.doesNotMatch(src, /status:\s*"pending"/);
});

test("proposal create starts as Draft with a server reference, not Sent", () => {
  const src = read("src/app/api/proposals/route.ts");
  assert.match(src, /status:\s*"Draft"/);
  assert.match(src, /next_reference/);
  assert.doesNotMatch(src, /status:\s*"Sent"/);
});

test("proposal send marks Sent only after delivery", () => {
  const src = read("src/app/api/proposals/send/route.ts");
  assert.match(src, /const delivered = result\.success && result\.status !== "skipped"/);
  assert.match(src, /if \(delivered\)/);
});

test("public proposal page performs no DB write during render", () => {
  const src = read("src/app/(marketing)/proposal/[secureToken]/page.tsx");
  assert.doesNotMatch(src, /\.update\(/);
});

test("approve route is hardened: origin + rate limit + RPC, no Math.random, no auto-project", () => {
  const src = read("src/app/api/proposals/[token]/approve/route.ts");
  assert.match(src, /allowedOrigin/);
  assert.match(src, /rateLimit\(/);
  assert.match(src, /approve_proposal/);
  assert.doesNotMatch(src, /Math\.random/);
  assert.doesNotMatch(src, /from\("projects"\)\s*\.insert/);
});

test("command center has no fabricated lead score or fake trend", () => {
  const src = read("src/app/admin/command-center/page.tsx");
  assert.doesNotMatch(src, /\|\|\s*35/);
  assert.doesNotMatch(src, /\+12\.5%/);
  assert.doesNotMatch(src, /lead_score\s*\|\|/);
});

test("AdminTriggers carries no prefilled demo invoice data", () => {
  const src = read("src/app/admin/components/AdminTriggers.tsx");
  assert.doesNotMatch(src, /INV-2026-001/);
  assert.doesNotMatch(src, /₹1,500\.00/);
});

test("outreach attribution comes from the session, never body.actor", () => {
  const src = read("src/app/api/admin/outreach/campaigns/route.ts");
  assert.doesNotMatch(src, /body\.actor/);
  assert.match(src, /auth\.email \?\? auth\.userId/);
});

test("support reply is persisted to the ticket thread", () => {
  const src = read("src/app/admin/actions.ts");
  assert.match(src, /support_ticket_messages/);
});

test("health endpoint 503s only on a failed live DB check", () => {
  const src = read("src/app/api/health/route.ts");
  assert.match(src, /checkDatabase/);
  assert.match(src, /dbHealthy/);
  assert.match(src, /status:\s*dbHealthy\s*\?\s*200\s*:\s*503/);
});

test("fake portal dashboard has been removed", () => {
  assert.throws(() => read("src/app/(portal)/dashboard/page.tsx"));
});
