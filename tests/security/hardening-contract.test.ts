import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { escapeHtml } from "../../src/lib/email/validation.ts";

const source = (path: string) => fs.readFileSync(path, "utf8");

test("all paid AI endpoints require verified users before reading bodies", () => {
  for (const route of ["ai", "chat", "serverless-ai"]) {
    const code = source(`src/app/api/${route}/route.ts`);
    assert.ok(code.includes("await guardAiRequest()"));
    assert.ok(code.indexOf("await guardAiRequest()") < code.indexOf("await readBoundedAiJson("));
    assert.ok(!code.includes("await req.json()") && !code.includes("await request.json()"));
  }
});

test("AI limiter fails closed in production and Redis path is atomic", () => {
  const code = source("src/lib/ai/rate-limit.ts");
  assert.ok(code.includes('process.env.NODE_ENV === "production") return false'));
  assert.ok(code.includes("redis.eval("));
  assert.ok(!code.includes("await redis.zcard("));
  const guard = source("src/lib/ai/request-guard.ts");
  for (const key of ["ai:user:", "ai:global:day", "reader.cancel()", "AI_MAX_BODY_BYTES"]) assert.ok(guard.includes(key));
});

test("admin authorization uses protected roles, never company email suffix", () => {
  const code = source("src/lib/auth/require-admin.ts");
  assert.ok(code.includes('select("role")'));
  assert.ok(code.includes('["admin", "super_admin"]'));
  assert.ok(!code.includes("endsWith("));
  assert.ok(!source("src/middleware.ts").includes("endsWith(\"@logic"));
});

test("welcome recipient is derived from the verified user", () => {
  const code = source("src/app/api/auth/send-welcome/route.ts");
  assert.ok(code.includes("await requireVerifiedUser()"));
  assert.ok(code.includes("userId: user.id") && code.includes("email: user.email"));
  assert.ok(!code.includes("req.json()"));
});



test("unsafe automated review execution removed; rollback reason uses env", () => {
  const grok = source(".github/workflows/grok-review.yml");
  assert.ok(!grok.includes("--always-approve") && !grok.includes("curl -fsSL"));
  assert.ok(!grok.includes("secrets.XAI_API_KEY") && !grok.includes("pull-requests: write"));
  const rollback = source(".github/workflows/rollback.yml");
  assert.ok(rollback.includes("ROLLBACK_REASON: ${{ github.event.inputs.reason }}"));
  assert.ok(!rollback.split("run: |")[1].includes("${{ github.event.inputs.reason }}"));
});

test("HTML fallback escapes malicious names, subjects and metadata", () => {
  assert.equal(escapeHtml('<img src=x onerror="attack()"> & \'name\''),
    "&lt;img src=x onerror=&quot;attack()&quot;&gt; &amp; &#39;name&#39;");
  assert.ok(source("src/lib/email/outbox.ts").includes("escapeHtml(JSON.stringify(params.metadata"));
});

test("support replies resolve the recipient on the server", () => {
  const code = source("src/app/admin/actions.ts");
  assert.ok(code.includes('select("requester_email, user_id")'));
  assert.ok(source("src/app/admin/support/[id]/support-ticket-actions.tsx").includes("replyToSupportTicket(ticketId, replyText)"));
});

test("public AI enquiries cannot enumerate emails or attach arbitrary ownership", () => {
  const lead = source("src/app/api/ai/lead/route.ts");
  assert.ok(!lead.includes("emailAlreadyCaptured") && !lead.includes("exists:"));
  assert.ok(lead.includes("userId: null") && lead.includes("chatId: null"));
  for (const route of ["lead", "ticket"]) {
    const code = source(`src/app/api/ai/${route}/route.ts`);
    assert.ok(code.includes('rateLimit("ai:enquiry:global:day"'));
    assert.ok(code.includes("readBoundedAiJson(request)"));
  }
});

test("handoff persistence failure is checked and account email is authoritative", () => {
  const code = source("src/app/api/ai/ticket/route.ts");
  assert.ok(code.includes("user?.email || body.email"));
  assert.ok(code.indexOf("if (saved.error)") < code.indexOf("await sendEmail("));
});
