import test from "node:test";
import assert from "node:assert/strict";
import { generateAuthoritativeReply, buildComprehensiveSystemPrompt } from "@/lib/ai/company-knowledge";
import { COMPANY } from "@/config/company";

test("chatbot authoritative reply: greeting messages return executive greeting", () => {
  const greetingQueries = [
    "hello",
    "hi",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
    "Hi!",
    "Hello there",
    "Hello",
    "HI",
  ];

  for (const query of greetingQueries) {
    const reply = generateAuthoritativeReply(query);
    assert.ok(reply.includes("Logic Intelligence Technologies"), `Expected company name in reply for '${query}'`);
    assert.ok(reply.includes("LIT Healthcare"), `Expected LIT Healthcare in reply for '${query}'`);
    assert.ok(reply.includes("Logic Voice"), `Expected Logic Voice in reply for '${query}'`);
    assert.ok(reply.includes("Voice Shield"), `Expected Voice Shield in reply for '${query}'`);
    assert.ok(reply.includes("₹8,999"), `Expected ₹8,999 pricing in reply for '${query}'`);
    assert.ok(reply.includes("Free Architecture Demo"), `Expected Free Architecture Demo in reply for '${query}'`);
    assert.ok(reply.includes(COMPANY.phone), `Expected phone in reply for '${query}'`);
  }
});

test("chatbot authoritative reply: specific topics bypass pure greeting", () => {
  const vsReply = generateAuthoritativeReply("Hello, tell me about voice shield");
  assert.ok(vsReply.includes("Sub-15ms Inline Latency"), "Should return Voice Shield specs");
  assert.ok(vsReply.includes("99.4% Deepfake Detection"), "Should return deepfake accuracy");

  const healthReply = generateAuthoritativeReply("Hi, what is LIT healthcare?");
  assert.ok(healthReply.includes("14 active hospital sites"), "Should return LIT Healthcare specs");
});

test("buildComprehensiveSystemPrompt contains explicit GREETING INSTRUCTION", () => {
  const prompt = buildComprehensiveSystemPrompt();
  const expectedInstruction =
    "GREETING INSTRUCTION: When the user says 'hello', 'hi', or offers a simple greeting, keep your response CONCISE, FORMAL, and HIGHLY PERSUASIVE. Introduce Logic Intelligence Technologies with executive prestige, highlight our flagship platforms (LIT Healthcare, Logic Voice, Voice Shield), state our Free Architecture Demo & fixed-price packages (from ₹8,999), and invite them to explore a working prototype demo or book a consultation.";
  assert.ok(prompt.includes(expectedInstruction), "System prompt must include explicit GREETING INSTRUCTION");
});
