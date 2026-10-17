import * as React from "react";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@react-email/components";
import {
  ReferenceButton,
  ReferenceFrame,
  ReferenceHero,
  ReferenceSection,
  ReferenceText,
} from "../emails/reference-design/components";
import { REFERENCE_EMAIL as R } from "../emails/reference-design/theme";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE_DIRECTORY = path.join(ROOT, "supabase", "templates");
const CONFIRMATION_URL = "{{ .ConfirmationURL }}";
// A valid URL is required by ReferenceButton's URL validation. Never send it.
const SENTINEL_URL = "https://auth-template.invalid/supabase-confirmation-url";

type AuthTemplate = {
  filename: "confirmation.html" | "recovery.html" | "invite.html" | "magic_link.html";
  title: string;
  preview: string;
  image: NonNullable<React.ComponentProps<typeof ReferenceHero>["image"]>;
  introduction: string;
  instruction?: string;
  buttonLabel: string;
  buttonVariant: React.ComponentProps<typeof ReferenceButton>["variant"];
  fallbackLabel: string;
  notice: string;
};

const TEMPLATES: readonly AuthTemplate[] = [
  {
    filename: "confirmation.html",
    title: "Verify your email address",
    preview: "Confirm your email address to continue with Logic Intelligence Technologies.",
    image: "verification",
    introduction: `Welcome to ${R.company}. Confirm your email address to continue setting up your account.`,
    buttonLabel: "Verify my email",
    buttonVariant: "orange",
    fallbackLabel: "If the button doesn’t work, copy and paste this verification link into your browser:",
    notice: "If you didn’t create an account, you can safely ignore this email.",
  },
  {
    filename: "recovery.html",
    title: "Reset your password",
    preview: "Follow this link to choose a new password for your account.",
    image: "verification",
    introduction: `We received a request to reset the password for your ${R.company} account.`,
    instruction: "Use the link below to choose a new password. Keep this link private and don’t share it with anyone.",
    buttonLabel: "Reset my password",
    buttonVariant: "purple",
    fallbackLabel: "If the button doesn’t work, copy and paste this password reset link into your browser:",
    notice: "If you didn’t request a password reset, you can safely ignore this email.",
  },
  {
    filename: "invite.html",
    title: "You’re invited to join us.",
    preview: "Your invitation to the Logic Intelligence Technologies workspace.",
    image: "workspace",
    introduction: `You’ve been invited to join the ${R.company} workspace.`,
    instruction: "Open your invitation to continue with your account setup.",
    buttonLabel: "Accept my invitation",
    buttonVariant: "blue",
    fallbackLabel: "If the button doesn’t work, copy and paste this invitation link into your browser:",
    notice: "If you weren’t expecting this invitation, check with your team before continuing.",
  },
  {
    filename: "magic_link.html",
    title: "Your sign-in link is here.",
    preview: "Sign in to your Logic Intelligence Technologies account without a password.",
    image: "verification",
    introduction: `Use this link to sign in to your ${R.company} account. You don’t need to enter a password for this sign-in.`,
    instruction: "Keep this link private. It gives access to your account.",
    buttonLabel: "Sign in to my account",
    buttonVariant: "orange",
    fallbackLabel: "If the button doesn’t work, copy and paste this sign-in link into your browser:",
    notice: "If you didn’t request this sign-in link, you can safely ignore this email.",
  },
];

function AuthEmail({ template }: { template: AuthTemplate }) {
  return (
    <ReferenceFrame preview={template.preview} tone="light">
      <ReferenceHero title={template.title} image={template.image} tone="light" compact />
      <ReferenceSection>
        <ReferenceText>{template.introduction}</ReferenceText>
        {template.instruction ? <ReferenceText>{template.instruction}</ReferenceText> : null}
        <ReferenceButton href={SENTINEL_URL} variant={template.buttonVariant}>
          {template.buttonLabel}
        </ReferenceButton>
        <ReferenceText muted>{template.notice}</ReferenceText>
      </ReferenceSection>
      <ReferenceSection cream>
        <ReferenceText muted>{template.fallbackLabel}</ReferenceText>
        <ReferenceText muted>
          <a
            href={SENTINEL_URL}
            style={{ color: R.colors.blue, textDecoration: "underline", wordBreak: "break-all" }}
          >
            {SENTINEL_URL}
          </a>
        </ReferenceText>
      </ReferenceSection>
    </ReferenceFrame>
  );
}

function placeholderCounts(html: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const placeholder of html.match(/{{[\s\S]*?}}/g) ?? []) {
    counts.set(placeholder, (counts.get(placeholder) ?? 0) + 1);
  }
  return counts;
}

function verifyHtml(html: string, template: AuthTemplate, original: string): void {
  const before = placeholderCounts(original);
  const after = placeholderCounts(html);
  assert.deepEqual([...before.keys()], [CONFIRMATION_URL], `${template.filename}: unexpected original provider placeholders; update the source before regenerating`);
  assert.deepEqual([...after.keys()], [...before.keys()], `${template.filename}: provider placeholder names or spelling changed`);
  for (const [placeholder, count] of before) {
    assert.ok((after.get(placeholder) ?? 0) >= count, `${template.filename}: removed an original provider placeholder`);
  }
  // Outlook VML CTA + normal CTA + fallback href + visible fallback URL.
  assert.equal(after.get(CONFIRMATION_URL), 4, `${template.filename}: expected all four provider URL uses`);
  assert.equal(html.split(`href="${CONFIRMATION_URL}"`).length - 1, 3, `${template.filename}: expected both CTA links and fallback link`);
  assert.ok(!html.includes("auth-template.invalid"), `${template.filename}: sentinel URL leaked`);
  assert.match(html, /<!DOCTYPE html/i);
  assert.match(html, /<html[^>]*lang="en"/);
  assert.match(html, /name="color-scheme" content="light"/);
  assert.ok(html.includes(`>${template.title}</h1>`), `${template.filename}: missing heading`);
  assert.ok(html.includes(`${R.assetUrl}/${template.image}.png`), `${template.filename}: missing hero artwork`);
  assert.match(html, /width="280"/);
  assert.match(html, /class="ref-brand"/);
  assert.match(html, /class="ref-footer"/);
  assert.match(html, /<v:roundrect\b/);
  assert.ok(!html.includes("Manage preferences or unsubscribe"), "Auth emails must not include a marketing unsubscribe footer");
  assert.doesNotMatch(html, /<script\b|data:|cid:/i);
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (value === CONFIRMATION_URL || value.startsWith("mailto:")) continue;
    assert.equal(new URL(value).protocol, "https:", `${template.filename}: non-HTTPS or relative URL: ${value}`);
  }
  for (const match of html.matchAll(/url\(['"]?([^'"\s)]+)['"]?\)/g)) {
    assert.equal(new URL(match[1]).protocol, "https:", `${template.filename}: font or CSS asset must use absolute HTTPS`);
  }
  for (const social of R.socials) {
    assert.ok(html.includes(`${R.assetUrl}/social-${social.icon}.png`), `${template.filename}: missing light-footer ${social.name} icon`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log("Usage: npx tsx scripts/render-auth-email-templates.tsx [--check]");
    return;
  }
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === "--check"), "Only --check is supported");
  const checkOnly = args[0] === "--check";

  // Finish all render and preservation checks before overwriting any template.
  const rendered = await Promise.all(TEMPLATES.map(async (template) => {
    const outputPath = path.join(TEMPLATE_DIRECTORY, template.filename);
    const original = await readFile(outputPath, "utf8");
    const renderedHtml = await render(<AuthEmail template={template} />);
    assert.equal(renderedHtml.split(SENTINEL_URL).length - 1, 4, `${template.filename}: sentinel render count changed`);
    // Replace only this exact rendered URL; never rewrite provider tokens or routes.
    const html = `${renderedHtml.split(SENTINEL_URL).join(CONFIRMATION_URL).trim()}\n`;
    verifyHtml(html, template, original);
    if (checkOnly) assert.equal(original, html, `${template.filename}: stale generated HTML; run this script without --check`);
    return { template, outputPath, original, html };
  }));

  for (const { template, outputPath, original, html } of rendered) {
    if (!checkOnly) await writeFile(outputPath, html, "utf8");
    const before = placeholderCounts(original).get(CONFIRMATION_URL);
    const after = placeholderCounts(html).get(CONFIRMATION_URL);
    console.log(`${checkOnly ? "Checked" : "Wrote"} supabase/templates/${template.filename}: ${CONFIRMATION_URL} ${before} → ${after}; ${Buffer.byteLength(html)} bytes`);
  }
  console.log("Verified 4 auth templates. Local HTML only; no auth configuration changed or email sent.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
