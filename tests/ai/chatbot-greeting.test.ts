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

test("chatbot authoritative reply: responses are strictly 4 to 5 lines of words", () => {
  const testQueries = [
    "hello",
    "tell me about voice shield",
    "what is logic voice",
    "explain LIT healthcare",
    "what are the prices and packages",
    "who is the founder",
    "what services do you offer",
    "random overview query",
  ];

  for (const q of testQueries) {
    const reply = generateAuthoritativeReply(q);
    const nonBlankLines = reply.trim().split("\n").map(l => l.trim()).filter(Boolean);
    assert.ok(
      nonBlankLines.length >= 4 && nonBlankLines.length <= 5,
      `Expected 4 to 5 lines for query '${q}', got ${nonBlankLines.length} lines: \n${reply}`
    );
    const wordCount = reply.trim().split(/\s+/).length;
    assert.ok(
      wordCount <= 90,
      `Expected concise word count (<= 90) for query '${q}', got ${wordCount} words`
    );
  }
});

test("buildComprehensiveSystemPrompt contains explicit GREETING INSTRUCTION and 4 to 5 lines brevity requirement", () => {
  const prompt = buildComprehensiveSystemPrompt();
  const expectedInstruction =
    "GREETING INSTRUCTION: When the user says 'hello', 'hi', or offers a simple greeting, keep your response CONCISE, FORMAL, and HIGHLY PERSUASIVE. Introduce Logic Intelligence Technologies with executive prestige, highlight our flagship platforms (LIT Healthcare, Logic Voice, Voice Shield), state our Free Architecture Demo & fixed-price packages (from ₹8,999), and invite them to explore a working prototype demo or book a consultation.";
  assert.ok(prompt.includes(expectedInstruction), "System prompt must include explicit GREETING INSTRUCTION");
  assert.ok(prompt.includes("4 to 5 lines of words"), "System prompt must specify 4 to 5 lines of words requirement");
});

test("chatbot launcher button matches exact dimensions of whatsapp button", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const waContent = fs.readFileSync(path.join(process.cwd(), "src/components/shared/floating-whatsapp.tsx"), "utf-8");
  const chatContent = fs.readFileSync(path.join(process.cwd(), "src/components/shared/support-chat-widget.tsx"), "utf-8");

  // WhatsApp dimensions: w-11 h-11 sm:w-14 sm:h-14 rounded-full
  assert.ok(waContent.includes("w-11 h-11 sm:w-14 sm:h-14 rounded-full"), "WhatsApp button must use standard size");
  assert.ok(chatContent.includes("w-11 h-11 sm:w-14 sm:h-14 rounded-full"), "Chatbot button must match exact size of WhatsApp button");
  assert.ok(chatContent.includes("/assets/logo-icon-256.webp"), "Chatbot button must use circle company logo icon");
});


