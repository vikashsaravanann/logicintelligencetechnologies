import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyByRules,
  replyClassificationSchema,
  REPLY_CATEGORIES,
  REPLY_CATEGORY_META,
  AUTO_ACTIONABLE,
} from "@/lib/outreach/intelligence/reply-schema";
import { WORKFLOWS, workflowForEvent } from "@/config/automation";

test("every reply category has display metadata", () => {
  for (const c of REPLY_CATEGORIES) {
    assert.ok(REPLY_CATEGORY_META[c], `meta for ${c}`);
    assert.ok(REPLY_CATEGORY_META[c].label.length > 0);
  }
});

test("rule classifier flags opt-out with high confidence, no human needed", () => {
  const r = classifyByRules(null, "Please unsubscribe me from this list.");
  assert.equal(r.category, "opt_out");
  assert.ok(r.confidence >= 0.8);
  assert.equal(r.requiresHuman, false);
});

test("rule classifier flags bounces", () => {
  const r = classifyByRules("Undeliverable: Mail delivery failed", "The recipient address was not found. 550 5.1.1");
  assert.equal(r.category, "bounce");
  assert.ok(r.confidence >= 0.8);
});

test("out-of-office is auto_reply and keeps the human gate", () => {
  const r = classifyByRules("Automatic reply", "I am currently out of the office until Monday.");
  assert.equal(r.category, "auto_reply");
  assert.equal(r.requiresHuman, true);
});

test("soft intents are low confidence and always need a human", () => {
  const pos = classifyByRules(null, "This sounds good, I'd be interested to chat.");
  assert.equal(pos.category, "positive");
  assert.ok(pos.confidence < 0.5);
  assert.equal(pos.requiresHuman, true);

  const no = classifyByRules(null, "Not interested, thanks.");
  assert.equal(no.category, "not_interested");
  assert.equal(no.requiresHuman, true);
});

test("unknown text is uncategorized and needs a human", () => {
  const r = classifyByRules(null, "The weather is nice today.");
  assert.equal(r.category, "uncategorized");
  assert.equal(r.requiresHuman, true);
});

test("only opt_out and bounce are auto-actionable", () => {
  assert.deepEqual([...AUTO_ACTIONABLE].sort(), ["bounce", "opt_out"]);
});

test("classification schema rejects an unknown category and out-of-range confidence", () => {
  assert.equal(replyClassificationSchema.safeParse({ category: "maybe", confidence: 0.5, rationale: "x" }).success, false);
  assert.equal(replyClassificationSchema.safeParse({ category: "positive", confidence: 1.5, rationale: "x" }).success, false);
  assert.equal(replyClassificationSchema.safeParse({ category: "positive", confidence: 0.5, rationale: "x" }).success, true);
});

test("an outreach-dispatch workflow is registered and resolvable by event", () => {
  const wf = workflowForEvent("outreach.message_approved");
  assert.ok(wf, "workflow exists for outreach.message_approved");
  assert.equal(wf!.name, "LIT — Outreach Dispatch");
  assert.ok(wf!.webhookPath.startsWith("/webhook/"));
  // keys stay unique across all workflows
  const keys = WORKFLOWS.map((w) => w.key);
  assert.equal(new Set(keys).size, keys.length);
});
