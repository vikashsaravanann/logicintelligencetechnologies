import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { render, toPlainText } from "@react-email/components";
import { EMAIL_TEMPLATE_REGISTRY } from "../../src/lib/email/template-registry";

const root = process.cwd();

test("every root email is represented in the redesigned preview registry", () => {
  const registrySource = readFileSync(path.join(root, "src/lib/email/template-registry.tsx"), "utf8") + readFileSync(path.join(root, "emails/operational-notice-previews.tsx"), "utf8");
  const templates = readdirSync(path.join(root, "emails")).filter(name => name.endsWith("-email.tsx"));
  assert.equal(templates.length, 41);
  for (const template of templates) {
    assert.ok(registrySource.includes(template.replace(/\.tsx$/, "")), `${template}: missing preview import`);
    const source = readFileSync(path.join(root, "emails", template), "utf8");
    assert.match(source, /<EmailLayout\s+design=(?:"[a-z]+"|\{design\})/, `${template}: missing shared design`);
  }
});

test("every registered email renders the complete reference design with existing business content", async () => {
  for (const [key, definition] of Object.entries(EMAIL_TEMPLATE_REGISTRY)) {
    const html = await render(definition.getElement());
    assert.match(html, /LOGIC INTELLIGENCE TECHNOLOGIES/, key);
    assert.match(html, /white-space:nowrap/, key);
    assert.match(html, /Nunito Sans/, key);
    assert.match(html, /email-assets\/reference\/(?:verification|welcome|campaign|night|onboarding|workspace|milestone|payment|support|maintenance)\.png/, key);
    for (const social of ["linkedin", "instagram", "x", "youtube"]) assert.ok(html.includes(`social-${social}`), `${key}: ${social}`);
    assert.doesNotMatch(html, /Headspace|lorem ipsum|undefined|\[object Object\]/i, key);
    assert.ok(Buffer.byteLength(html) < 90_000, `${key}: email clipping risk`);
    assert.ok(toPlainText(html).length > 200, `${key}: missing plain-text content`);
    for (const match of html.matchAll(/src="https:\/\/www\.logicintelligencetechnologies\.in([^"?]+)(?:\?[^"<]*)?"/g)) {
      assert.ok(existsSync(path.join(root, "public", match[1])), `${key}: missing local image ${match[1]}`);
    }
  }
});

test("all four native authentication templates preserve provider action placeholders", () => {
  for (const name of ["confirmation", "recovery", "invite", "magic_link"]) {
    const html = readFileSync(path.join(root, `supabase/templates/${name}.html`), "utf8");
    assert.match(html, /LOGIC INTELLIGENCE TECHNOLOGIES/, name);
    assert.match(html, /Nunito Sans/, name);
    assert.match(html, /href="\{\{ \.ConfirmationURL \}\}"/, name);
    assert.match(html, /social-linkedin/, name);
    assert.doesNotMatch(html, /sentinel|example\.com|Headspace|javascript:/i, name);
    assert.equal((html.match(/\{\{\s*\.ConfirmationURL\s*\}\}/g) ?? []).length, 4, name);
    assert.ok(Buffer.byteLength(html) < 90_000, name);
  }
});

test("queued operational notices retain plain text and escape dynamic HTML", async () => {
  const { renderOperationalNoticeEmail } = await import("../../src/lib/email/render-operational-notice");
  const text = 'First line\n<script>alert("test")</script>\nReference: DEMO-1';
  const result = await renderOperationalNoticeEmail({ title: 'Review <img src=x>', text, design: "maintenance" });
  assert.equal(result.text, text);
  assert.doesNotMatch(result.html, /<script>|<img src=x>/);
  assert.match(result.html, /&lt;script&gt;/);
  assert.match(result.html, /Reference: DEMO-1/);
  const { default: OperationalNoticeEmail } = await import("../../emails/operational-notice-email");
  const React = await import("react");
  for (const actionUrl of ["javascript:alert(1)", "https://unrelated.example/sign-in", "//unrelated.example", "https://www.logicintelligencetechnologies.in/\\evil"]) {
    const html = await render(React.createElement(OperationalNoticeEmail, { title: "Notice", text: "Details", actionUrl, actionLabel: "Unsafe action" }));
    assert.doesNotMatch(html, /Unsafe action/);
  }
});


test("shared email modules remain importable by React server pages", () => {
  const result = spawnSync(process.execPath, [
    "--conditions=react-server", "--import", "tsx", "--input-type=module", "-e",
    "await import('./emails/components/email-layout.tsx'); await import('./emails/reference-design/components.tsx');",
  ], { cwd: root, encoding: "utf8", timeout: 30_000 });
  assert.equal(result.status, 0, result.stderr || String(result.error ?? "Server import failed"));
});
