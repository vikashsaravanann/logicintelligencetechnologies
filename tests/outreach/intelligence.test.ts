import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generatorInputSchema,
  generatorOutputSchema,
  OPPORTUNITY_TYPES,
  INSUFFICIENT_EVIDENCE,
} from "@/lib/outreach/intelligence/message-schema";
import { OPPORTUNITY_GUIDANCE, guidanceFor } from "@/lib/outreach/intelligence/opportunities";
import { runGates, qaScore, passesBlockers } from "@/lib/outreach/intelligence/qa-gates";
import { OUTREACH_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/outreach/intelligence/prompt";

const goodInput = {
  company_name: "Harbour Cafe",
  opportunity_type: "L4_performance" as const,
  channel: "email" as const,
  evidence: [
    {
      kind: "technical_measurement" as const,
      statement: "Mobile PageSpeed performance measured 42/100.",
      source: "PageSpeed Insights",
      measured_value: "42/100",
      data_source: "lab" as const,
      checked_at: "2026-10-06",
    },
  ],
};

const goodOutput = {
  subject: "Quick note about Harbour Cafe's mobile site",
  observation: "I ran a mobile check on Harbour Cafe and the performance test returned 42/100 on 2026-10-06.",
  impact: "That suggests there may be room to reduce the work before the page becomes usable on mobile.",
  cta: "Want me to send the main items behind the result?",
  body:
    "Hi there, I ran a mobile check on Harbour Cafe and the performance test returned 42/100 on 2026-10-06. " +
    "That suggests there may be room to reduce the work before the page becomes usable on mobile. " +
    "Want me to send the main items behind the result?",
  evidence_used: ["Mobile PageSpeed performance measured 42/100."],
  claims_requiring_review: [],
};

const cleared = { complianceCleared: true, noRecentDuplicate: true };

test("input schema is strict and validates a good input", () => {
  assert.ok(generatorInputSchema.safeParse(goodInput).success);
  assert.ok(!generatorInputSchema.safeParse({ ...goodInput, secret: "x" }).success);
});

test("output schema rejects unknown keys and over-long body", () => {
  assert.ok(generatorOutputSchema.safeParse(goodOutput).success);
  assert.ok(!generatorOutputSchema.safeParse({ ...goodOutput, extra: 1 }).success);
});

test("every opportunity type has guidance", () => {
  for (const t of OPPORTUNITY_TYPES) {
    assert.ok(guidanceFor(t).label.length > 0, t);
  }
  assert.equal(Object.keys(OPPORTUNITY_GUIDANCE).length, OPPORTUNITY_TYPES.length);
});

test("a clean, evidence-backed draft passes all blocker gates", () => {
  const gates = runGates(generatorInputSchema.parse(goodInput), goodOutput, cleared);
  assert.ok(passesBlockers(gates), JSON.stringify(gates.filter((g) => !g.pass)));
  assert.ok(qaScore(generatorInputSchema.parse(goodInput), goodOutput, gates).total >= 45);
});

test("claim-safety gate blocks unsupported revenue/conversion claims", () => {
  const bad = { ...goodOutput, body: goodOutput.body + " You're losing customers and it's costing you thousands." };
  const gates = runGates(generatorInputSchema.parse(goodInput), bad, cleared);
  assert.ok(!gates.find((g) => g.key === "claim_safety")!.pass);
  assert.ok(!gates.find((g) => g.key === "factuality")!.pass);
  assert.ok(!passesBlockers(gates));
});

test("gate blocks a '40% of mobile traffic' style claim", () => {
  const bad = { ...goodOutput, body: goodOutput.body + " You're losing 40% of mobile traffic." };
  const gates = runGates(generatorInputSchema.parse(goodInput), bad, cleared);
  assert.ok(!gates.find((g) => g.key === "claim_safety")!.pass);
});

test("personalization gate blocks an invented recipient name", () => {
  const bad = { ...goodOutput, body: "Hi Sarah, " + goodOutput.body };
  const gates = runGates(generatorInputSchema.parse(goodInput), bad, cleared);
  assert.ok(!gates.find((g) => g.key === "personalization")!.pass);
});

test("specificity gate blocks unfilled placeholders", () => {
  const bad = { ...goodOutput, body: "Hi there, about {{company_name}} ..." };
  const gates = runGates(generatorInputSchema.parse(goodInput), bad, cleared);
  assert.ok(!gates.find((g) => g.key === "specificity")!.pass);
});

test("tone gate blocks sensational wording", () => {
  const bad = { ...goodOutput, subject: "URGENT: double your sales guaranteed" };
  const gates = runGates(generatorInputSchema.parse(goodInput), bad, cleared);
  assert.ok(!gates.find((g) => g.key === "tone")!.pass);
});

test("friction gate blocks a meeting demand CTA", () => {
  const bad = { ...goodOutput, cta: "Schedule a 30-min call with us this week." };
  const gates = runGates(generatorInputSchema.parse(goodInput), bad, cleared);
  assert.ok(!gates.find((g) => g.key === "friction")!.pass);
});

test("compliance + duplication gates reflect the supplied context", () => {
  const gates = runGates(generatorInputSchema.parse(goodInput), goodOutput, {
    complianceCleared: false,
    noRecentDuplicate: false,
  });
  assert.ok(!gates.find((g) => g.key === "compliance")!.pass);
  assert.ok(!gates.find((g) => g.key === "duplication")!.pass);
  assert.ok(!passesBlockers(gates));
});

test("system prompt forbids fabrication and mandates the insufficient sentinel", () => {
  assert.match(OUTREACH_SYSTEM_PROMPT, /Never invent/);
  assert.match(OUTREACH_SYSTEM_PROMPT, /do not dump a service list/i);
  assert.ok(OUTREACH_SYSTEM_PROMPT.includes(INSUFFICIENT_EVIDENCE));
});

test("user prompt carries the evidence and never a raw secret field", () => {
  const p = buildUserPrompt(generatorInputSchema.parse(goodInput));
  assert.match(p, /42\/100/);
  assert.match(p, /Harbour Cafe/);
  assert.ok(!/password|api[_-]?key|secret/i.test(p));
});
