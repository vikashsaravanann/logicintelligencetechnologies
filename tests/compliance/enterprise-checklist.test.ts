import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ENTERPRISE_CHECKPOINTS,
  ENTERPRISE_PHASES,
  ENTERPRISE_CHECKLIST_METADATA,
} from "@/data/enterpriseDeploymentChecklist";
import {
  generateChecklistToken,
  hashToken,
  isWellFormedToken,
  generateConfirmationReference,
  checklistTokenState,
  buildChecklistWhatsAppShareUrl,
} from "@/lib/enterprise-checklist/token-core";

test("Enterprise checklist data contains exactly 50 checkpoints across 8 phases", () => {
  assert.equal(ENTERPRISE_CHECKPOINTS.length, 50, "Must have exactly 50 checkpoints");
  assert.equal(ENTERPRISE_PHASES.length, 8, "Must have exactly 8 phases");

  // Verify sequential checkpoint numbers 1 through 50
  for (let i = 0; i < 50; i++) {
    const cp = ENTERPRISE_CHECKPOINTS[i];
    assert.equal(cp.number, i + 1, `Checkpoint at index ${i} must have number ${i + 1}`);
    assert.ok(cp.title.trim().length > 0, `Checkpoint ${cp.number} must have non-empty title`);
    assert.ok(
      cp.engineering_requirement.trim().length > 0,
      `Checkpoint ${cp.number} must have non-empty engineering_requirement`
    );
    assert.ok(
      cp.acceptance_criteria.trim().length > 0,
      `Checkpoint ${cp.number} must have non-empty acceptance_criteria`
    );
    assert.ok(
      cp.verification_evidence.trim().length > 0,
      `Checkpoint ${cp.number} must have non-empty verification_evidence`
    );
    assert.ok(cp.phase >= 1 && cp.phase <= 8, `Checkpoint ${cp.number} phase must be between 1 and 8`);
    assert.ok(cp.pdf_page >= 1 && cp.pdf_page <= 21, `Checkpoint ${cp.number} pdf_page must be within 21 pages`);
  }

  // Verify phases sum to 50
  const phaseSum = ENTERPRISE_PHASES.reduce((acc, ph) => acc + ph.checkpoints.length, 0);
  assert.equal(phaseSum, 50, "Checkpoints across all 8 phases must total 50");
});

test("Enterprise checklist metadata conforms to authoritative PDF source", () => {
  assert.equal(ENTERPRISE_CHECKLIST_METADATA.source_pages, 21);
  assert.equal(ENTERPRISE_CHECKLIST_METADATA.checkpoint_count, 50);
  assert.equal(ENTERPRISE_CHECKLIST_METADATA.phase_count, 8);
  assert.equal(
    ENTERPRISE_CHECKLIST_METADATA.source_pdf_sha256,
    "32a114705c56eaf06686d677af51c86ce6bd586b724a01cf1ab4bbb26f988404"
  );
});

test("Checklist token security: generation, hashing, and validation", () => {
  const { token, tokenHash } = generateChecklistToken();
  assert.equal(token.length, 43, "Raw token must be 32 bytes base64url (43 characters)");
  assert.ok(isWellFormedToken(token), "Generated token must pass well-formed validation");

  const computedHash = hashToken(token);
  assert.equal(tokenHash, computedHash, "Generated tokenHash must match computed SHA-256");
  assert.equal(tokenHash.length, 64, "SHA-256 hash must be 64 hex characters");

  // Invalid tokens
  assert.equal(isWellFormedToken(""), false);
  assert.equal(isWellFormedToken("short"), false);
  assert.equal(isWellFormedToken("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"), false, "Non-base64url characters rejected");
  assert.equal(isWellFormedToken(`${token}extra`), false, "Too long rejected");
  assert.equal(isWellFormedToken(null as any), false);
});

test("Confirmation reference generation format CHK-YYYY-XXXXXX", () => {
  const currentYear = new Date().getFullYear().toString();
  const ref = generateConfirmationReference();
  assert.match(
    ref,
    new RegExp(`^CHK-${currentYear}-[A-Z0-9]{6}$`),
    `Confirmation reference must match CHK-${currentYear}-XXXXXX format`
  );
});

test("Checklist token lifecycle state resolution", () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Active / Valid
  assert.equal(
    checklistTokenState({
      expires_at: futureDate,
    }),
    "valid"
  );

  // Expired
  assert.equal(
    checklistTokenState({
      expires_at: pastDate,
    }),
    "expired"
  );

  // Revoked
  assert.equal(
    checklistTokenState({
      expires_at: futureDate,
      revoked_at: pastDate,
    }),
    "revoked"
  );

  // Submitted
  assert.equal(
    checklistTokenState({
      expires_at: futureDate,
      submitted_at: pastDate,
    }),
    "submitted"
  );

  // Null row
  assert.equal(checklistTokenState(null), "invalid");
});

test("WhatsApp sharing URL builder constructs clean encoded links", () => {
  const shareUrl = buildChecklistWhatsAppShareUrl({
    recipientName: "Acme CTO",
    invitationUrl: "https://www.logicintelligencetechnologies.in/enterprise-checklist/abc123def456",
  });

  assert.ok(shareUrl.startsWith("https://wa.me/?text="));
  assert.ok(shareUrl.includes("Acme%20CTO") || shareUrl.includes("Acme+CTO"));
  assert.ok(shareUrl.includes("enterprise-checklist"));
});

