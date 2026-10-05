import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { escapeHtml } from "../../src/lib/email/validation.ts";
import { personalize, firstNameFrom } from "../../src/lib/outreach/personalize.ts";

test("a lead name with markup stays text in outreach email HTML", () => {
  const name = '<a href="https://evil.example">Click</a> Smith';
  const first = firstNameFrom(name);
  const html = personalize("<p>Hello {{firstName}}, thanks {{fullName}}</p>", {
    firstName: escapeHtml(first),
    fullName: escapeHtml(name),
  });
  assert.ok(!html.includes("<a "), html);
  assert.ok(html.includes("&lt;a"), html);
});

test("the follow-up cron escapes every name it puts into body HTML", () => {
  const code = fs.readFileSync("src/app/api/cron/outreach-followups/route.ts", "utf8");
  const body = code.slice(code.indexOf("let bodyHtml = personalize("), code.indexOf("const idempotencyKey"));
  for (const v of ["firstName: escapeHtml(first)", "fullName: escapeHtml(fullName)", "firstNameBlock: firstNameBlockHtml"]) {
    assert.ok(body.includes(v), `missing ${v}`);
  }
  assert.ok(code.includes("const firstNameBlockHtml = escapeHtml(firstNameBlock)"));
});
