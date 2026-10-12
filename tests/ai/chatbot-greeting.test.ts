import test from "node:test";
import assert from "node:assert/strict";
import { generateAuthoritativeReply, buildComprehensiveSystemPrompt, isGreetingOnly } from "@/lib/ai/company-knowledge";
import { COMPANY } from "@/config/company";

test("chatbot authoritative reply: greeting messages return single professional greeting only", () => {
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
    assert.ok(isGreetingOnly(query), `Expected isGreetingOnly to be true for '${query}'`);
    const reply = generateAuthoritativeReply(query);
    assert.equal(
      reply,
      "Hello! How may I assist you today?",
      `Expected single professional greeting for query '${query}', got: '${reply}'`
    );
  }
});

test("chatbot authoritative reply: substantive queries with greeting bypass pure greeting", () => {
  const vsQuery = "Hello, tell me about voice shield";
  assert.equal(isGreetingOnly(vsQuery), false, "Should not treat question as pure greeting");
  const vsReply = generateAuthoritativeReply(vsQuery);
  assert.ok(vsReply.includes("Voice Shield"), "Should return Voice Shield details");
  assert.ok(vsReply.includes("biometric firewall"), "Should return firewall scope");

  const healthQuery = "Hi, what is LIT healthcare?";
  assert.equal(isGreetingOnly(healthQuery), false, "Should not treat question as pure greeting");
  const healthReply = generateAuthoritativeReply(healthQuery);
  assert.ok(healthReply.includes("LIT Healthcare"), "Should return LIT Healthcare details");
  assert.ok(!healthReply.includes("14 active hospital sites"), "Must not include unverified installation numbers");
});

test("chatbot authoritative reply: short information queries are strictly 3 to 4 content lines", () => {
  const shortQueries = [
    "tell me about voice shield",
    "what is logic voice",
    "explain LIT healthcare",
    "what are the prices and packages",
    "who is the founder",
    "what services do you offer",
  ];

  for (const q of shortQueries) {
    const reply = generateAuthoritativeReply(q);
    const nonBlankLines = reply.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    assert.ok(
      nonBlankLines.length >= 3 && nonBlankLines.length <= 4,
      `Expected 3 to 4 lines for short query '${q}', got ${nonBlankLines.length} lines: \n${reply}`
    );
    const wordCount = reply.trim().split(/\s+/).length;
    assert.ok(
      wordCount <= 95,
      `Expected concise word count (<= 95) for short query '${q}', got ${wordCount} words`
    );
  }
});

test("chatbot authoritative reply: detailed requests return 10 to 15 content lines", () => {
  const detailedQueries = [
    "explain logic voice features in detail",
    "explain LIT healthcare in detail",
    "what are the prices and packages in detail",
    "compare your products in detail",
  ];

  for (const q of detailedQueries) {
    const reply = generateAuthoritativeReply(q);
    const nonBlankLines = reply.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    assert.ok(
      nonBlankLines.length >= 10 && nonBlankLines.length <= 15,
      `Expected 10 to 15 lines for detailed query '${q}', got ${nonBlankLines.length} lines: \n${reply}`
    );
  }
});

test("buildComprehensiveSystemPrompt adheres to intent modes and formatting policies", () => {
  const prompt = buildComprehensiveSystemPrompt();
  assert.ok(prompt.includes("GREETING_ONLY"), "Prompt must include GREETING_ONLY intent");
  assert.ok(prompt.includes("SHORT_INFORMATION"), "Prompt must include SHORT_INFORMATION intent");
  assert.ok(prompt.includes("DETAILED_INFORMATION"), "Prompt must include DETAILED_INFORMATION intent");
  assert.ok(prompt.includes("Markdown presentation"), "Prompt must specify Markdown presentation rules");
  assert.ok(!prompt.includes("14 active hospital sites"), "Must not include unverified hospital counts");
});

test("chatbot launcher button matches exact dimensions of whatsapp button", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const waContent = fs.readFileSync(path.join(process.cwd(), "src/components/shared/floating-whatsapp.tsx"), "utf-8");
  const chatContent = fs.readFileSync(path.join(process.cwd(), "src/components/shared/support-chat-widget.tsx"), "utf-8");

  assert.ok(waContent.includes("w-11 h-11 sm:w-14 sm:h-14 rounded-full"), "WhatsApp button must use standard size");
  assert.ok(chatContent.includes("w-11 h-11 sm:w-14 sm:h-14 rounded-full"), "Chatbot button must match exact size of WhatsApp button");
  assert.ok(chatContent.includes("/assets/logo-icon-256.webp"), "Chatbot button must use circle company logo icon");
});
