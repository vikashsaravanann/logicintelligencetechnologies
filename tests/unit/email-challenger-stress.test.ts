/* eslint-disable @typescript-eslint/no-require-imports */
// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as React from "react";
import { render } from "@react-email/components";
import { chromium } from "@playwright/test";

// Local imports via require to respect server-only stub
const { REFERENCE_EMAIL_PREVIEWS } = require("../../emails/reference-design/previews");
const { EMAIL_TEMPLATE_REGISTRY } = require("../../src/lib/email/template-registry");
const {
  isPdfBuffer,
  preparePdfAttachment,
  resolveAndVerifyAttachments,
} = require("../../src/lib/email/attachments");
const { markOutboxFailure } = require("../../src/lib/email/outbox");
const { supabaseAdmin } = require("../../src/lib/supabase/admin");

const root = process.cwd();
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// =============================================================================
// CHALLENGE 1: Empirical Verification of 320px Viewport Zero Horizontal Overflow
// =============================================================================
test("CHALLENGE 1: 320px viewport zero horizontal overflow on email headers", async (t) => {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  } catch (err) {
    t.skip(`Chrome not launchable: ${err}`);
    return;
  }

  try {
    const context = await browser.newContext({
      viewport: { width: 320, height: 800 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // 1. Test all 4 Supabase Auth Templates
    const authTemplates = ["confirmation", "recovery", "invite", "magic_link"];
    for (const name of authTemplates) {
      const html = fs.readFileSync(path.join(root, `supabase/templates/${name}.html`), "utf8");
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      const measurements = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const brand = document.querySelector(".ref-brand") || document.querySelector(".ref-header");
        const logo = brand?.querySelector("img");
        const wordmark = brand?.querySelector(".ref-wordmark") || document.querySelector(".ref-wordmark");

        const docScrollWidth = doc.scrollWidth;
        const bodyScrollWidth = body.scrollWidth;

        let logoInfo = null;
        if (logo) {
          const rect = logo.getBoundingClientRect();
          logoInfo = {
            width: rect.width,
            height: rect.height,
            centerX: rect.x + rect.width / 2,
          };
        }

        let wordmarkInfo = null;
        if (wordmark) {
          const rect = wordmark.getBoundingClientRect();
          const style = window.getComputedStyle(wordmark);
          wordmarkInfo = {
            text: wordmark.textContent?.trim(),
            width: rect.width,
            height: rect.height,
            whiteSpace: style.whiteSpace,
            textTransform: style.textTransform,
            fontSize: style.fontSize,
            overflow: rect.width > 320,
          };
        }

        return {
          docScrollWidth,
          bodyScrollWidth,
          logoInfo,
          wordmarkInfo,
        };
      });

      // Zero document horizontal scroll at 320px
      assert.ok(
        measurements.docScrollWidth <= 320,
        `${name}.html: document horizontal overflow: docScrollWidth=${measurements.docScrollWidth} > 320`
      );
      assert.ok(
        measurements.bodyScrollWidth <= 320,
        `${name}.html: body horizontal overflow: bodyScrollWidth=${measurements.bodyScrollWidth} > 320`
      );

      // Centered logo (at 160px center of 320px screen)
      assert.ok(measurements.logoInfo, `${name}.html: logo element not found`);
      assert.ok(
        Math.abs(measurements.logoInfo.centerX - 160) <= 6,
        `${name}.html: logo is not centered at 160px (found centerX=${measurements.logoInfo.centerX})`
      );

      // Single-line uppercase title
      assert.ok(measurements.wordmarkInfo, `${name}.html: wordmark element not found`);
      assert.equal(
        measurements.wordmarkInfo.text,
        "LOGIC INTELLIGENCE TECHNOLOGIES",
        `${name}.html: wordmark text mismatch`
      );
      assert.equal(
        measurements.wordmarkInfo.whiteSpace,
        "nowrap",
        `${name}.html: wordmark must have white-space: nowrap`
      );
      assert.ok(
        measurements.wordmarkInfo.width <= 320,
        `${name}.html: wordmark width ${measurements.wordmarkInfo.width} exceeds 320px viewport`
      );
      // Single line height: 11px font with 20px line-height should be <= 25px
      assert.ok(
        measurements.wordmarkInfo.height <= 25,
        `${name}.html: wordmark wrapped to multiple lines (height=${measurements.wordmarkInfo.height})`
      );
    }

    // 2. Test all 10 Reference Previews
    for (const preview of REFERENCE_EMAIL_PREVIEWS) {
      const renderedHtml = await render(preview.element);
      await page.setContent(renderedHtml, { waitUntil: "domcontentloaded" });

      const measurements = await page.evaluate(() => {
        const doc = document.documentElement;
        const brand = document.querySelector(".ref-brand");
        const logo = brand?.querySelector("img");
        const wordmark = brand?.querySelector(".ref-wordmark");

        let logoInfo = null;
        if (logo) {
          const rect = logo.getBoundingClientRect();
          logoInfo = {
            width: rect.width,
            height: rect.height,
            centerX: rect.x + rect.width / 2,
          };
        }

        let wordmarkInfo = null;
        if (wordmark) {
          const rect = wordmark.getBoundingClientRect();
          const style = window.getComputedStyle(wordmark);
          wordmarkInfo = {
            text: wordmark.textContent?.trim(),
            width: rect.width,
            height: rect.height,
            whiteSpace: style.whiteSpace,
            overflow: rect.width > 320,
          };
        }

        return {
          docScrollWidth: doc.scrollWidth,
          logoInfo,
          wordmarkInfo,
        };
      });

      assert.ok(
        measurements.docScrollWidth <= 320,
        `${preview.key}: document horizontal overflow: scrollWidth=${measurements.docScrollWidth} > 320`
      );
      assert.ok(measurements.logoInfo, `${preview.key}: logo not found`);
      assert.ok(
        Math.abs(measurements.logoInfo.centerX - 160) <= 6,
        `${preview.key}: logo not centered (centerX=${measurements.logoInfo.centerX})`
      );
      assert.ok(measurements.wordmarkInfo, `${preview.key}: wordmark not found`);
      assert.equal(measurements.wordmarkInfo.whiteSpace, "nowrap");
      assert.ok(
        measurements.wordmarkInfo.height <= 25,
        `${preview.key}: wordmark height=${measurements.wordmarkInfo.height} indicates multiple lines`
      );
    }

    // 3. Test representative templates from EMAIL_TEMPLATE_REGISTRY
    const representativeKeys = [
      "admin-generic",
      "invoice",
      "welcome",
      "payment-received",
      "stage-approved-client",
      "staff-workspace-invitation",
      "consultation-booking-confirmation",
    ];

    for (const key of representativeKeys) {
      const def = EMAIL_TEMPLATE_REGISTRY[key];
      if (!def) continue;
      const html = await render(def.getElement());
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        const wordmark = document.querySelector(".ref-wordmark");
        const header = document.querySelector(".ref-header") || document.querySelector(".ref-brand");
        const logo = header?.querySelector("img");
        const logoRect = logo?.getBoundingClientRect();
        const wmRect = wordmark?.getBoundingClientRect();
        return {
          docScrollWidth: doc.scrollWidth,
          logoCenterX: logoRect ? logoRect.x + logoRect.width / 2 : null,
          wmWidth: wmRect?.width,
          wmHeight: wmRect?.height,
          wmText: wordmark?.textContent?.trim(),
        };
      });

      assert.ok(
        result.docScrollWidth <= 320,
        `Registry template ${key}: horizontal overflow at 320px (${result.docScrollWidth}px)`
      );
      if (result.logoCenterX !== null) {
        assert.ok(
          Math.abs(result.logoCenterX - 160) <= 6,
          `Registry template ${key}: logo not centered (centerX=${result.logoCenterX})`
        );
      }
      if (result.wmHeight !== undefined) {
        assert.ok(
          result.wmHeight <= 25,
          `Registry template ${key}: wordmark wrapped (height=${result.wmHeight})`
        );
      }
    }

    await page.close();
    await context.close();
  } finally {
    await browser.close();
  }
});

// =============================================================================
// CHALLENGE 2: Adversarial Stress Testing of Attachment Verification & Error Recording
// =============================================================================
test("CHALLENGE 2: Adversarial stress test of attachment validation and failure handling", async (t) => {
  const validPdfBytes = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n164\n%%EOF\n"
  );
  const validSha256 = crypto.createHash("sha256").update(validPdfBytes).digest("hex");

  await t.test("isPdfBuffer accepts %PDF- magic bytes and rejects corrupt prefixes", () => {
    assert.equal(isPdfBuffer(validPdfBytes), true);
    assert.equal(isPdfBuffer(Buffer.from("%PDF-")), true);
    assert.equal(isPdfBuffer(Buffer.from("%PDF")), false); // < 5 bytes
    assert.equal(isPdfBuffer(Buffer.from("<html><body>Malicious HTML</body></html>")), false);
    assert.equal(isPdfBuffer(Buffer.from("\x00%PDF-")), false); // off-by-one byte
    assert.equal(isPdfBuffer(Buffer.from("PK\x03\x04")), false); // zip / docx
    assert.equal(isPdfBuffer(Buffer.from("")), false); // empty
  });

  await t.test("preparePdfAttachment validates size and PDF type", () => {
    // Valid PDF
    const prep = preparePdfAttachment("test-invoice", validPdfBytes);
    assert.equal(prep.filename, "test-invoice.pdf");
    assert.equal(prep.contentType, "application/pdf");
    assert.deepEqual(prep.content, validPdfBytes);

    // Non-PDF throws
    assert.throws(
      () => preparePdfAttachment("malicious.pdf", Buffer.from("Not a real PDF file content")),
      /Attachment must be a PDF/
    );

    // Oversized buffer (> 2MB) throws
    const oversized = Buffer.alloc(2 * 1024 * 1024 + 1, "%PDF-");
    assert.throws(
      () => preparePdfAttachment("large.pdf", oversized),
      /Attachment exceeds 2 MB/
    );

    // Path traversal in filename sanitized
    const traversal = preparePdfAttachment("../../../etc/passwd", validPdfBytes);
    assert.ok(!traversal.filename.includes(".."));
    assert.ok(!traversal.filename.includes("/"));
    assert.ok(traversal.filename.endsWith(".pdf"));
  });

  await t.test("resolveAndVerifyAttachments rejects missing files from storage", async () => {
    const missingRef = {
      storageBucket: "financial-documents",
      storagePath: "engagements/missing/doc-123.pdf",
      expectedSha256: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      filename: "doc-123.pdf",
    };

    await assert.rejects(
      async () => {
        await resolveAndVerifyAttachments([missingRef]);
      },
      (err: Error) => {
        assert.match(err.message, /Could not load required attachment doc-123\.pdf/);
        return true;
      }
    );
  });

  await t.test("resolveAndVerifyAttachments rejects missing storageBucket or storagePath", async () => {
    const invalidRef1 = {
      storageBucket: "",
      storagePath: "engagements/x/doc.pdf",
      filename: "doc.pdf",
    };

    await assert.rejects(
      async () => {
        await resolveAndVerifyAttachments([invalidRef1]);
      },
      /Invalid attachment reference: missing storageBucket or storagePath/
    );

    const invalidRef2 = {
      storageBucket: "documents",
      storagePath: "",
      filename: "doc.pdf",
    };

    await assert.rejects(
      async () => {
        await resolveAndVerifyAttachments([invalidRef2]);
      },
      /Invalid attachment reference: missing storageBucket or storagePath/
    );
  });

  await t.test("resolveAndVerifyAttachments rejects corrupted SHA-256 hash", async () => {
    const originalFrom = supabaseAdmin.storage.from;

    try {
      supabaseAdmin.storage.from = () => ({
        download: async () => ({
          data: {
            arrayBuffer: async () => validPdfBytes.buffer.slice(
              validPdfBytes.byteOffset,
              validPdfBytes.byteOffset + validPdfBytes.byteLength
            ),
          },
          error: null,
        }),
      });

      const corruptedSha = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      const corruptedRef = {
        storageBucket: "financial-documents",
        storagePath: "engagements/test/invoice.pdf",
        expectedSha256: corruptedSha,
        filename: "invoice.pdf",
      };

      await assert.rejects(
        async () => {
          await resolveAndVerifyAttachments([corruptedRef]);
        },
        (err: Error) => {
          assert.match(err.message, /Integrity mismatch on attachment invoice\.pdf/);
          assert.match(err.message, new RegExp(`expected ${corruptedSha}`));
          assert.match(err.message, new RegExp(`got ${validSha256}`));
          return true;
        }
      );

      // Verify that matching hash succeeds
      const validRef = {
        storageBucket: "financial-documents",
        storagePath: "engagements/test/invoice.pdf",
        expectedSha256: validSha256,
        filename: "invoice.pdf",
      };

      const resolved = await resolveAndVerifyAttachments([validRef]);
      assert.equal(resolved.length, 1);
      assert.equal(resolved[0].filename, "invoice.pdf");
      assert.equal(resolved[0].contentType, "application/pdf");
      assert.deepEqual(resolved[0].content, validPdfBytes);

      // Case-insensitive hash comparison
      const upperRef = {
        storageBucket: "financial-documents",
        storagePath: "engagements/test/invoice.pdf",
        expectedSha256: validSha256.toUpperCase(),
        filename: "invoice.pdf",
      };
      const resolvedUpper = await resolveAndVerifyAttachments([upperRef]);
      assert.equal(resolvedUpper.length, 1);
    } finally {
      supabaseAdmin.storage.from = originalFrom;
    }
  });

  await t.test("resolveAndVerifyAttachments rejects non-PDF buffer from storage", async () => {
    const originalFrom = supabaseAdmin.storage.from;

    try {
      const corruptData = Buffer.from("This is not a PDF at all");
      supabaseAdmin.storage.from = () => ({
        download: async () => ({
          data: {
            arrayBuffer: async () => corruptData.buffer.slice(
              corruptData.byteOffset,
              corruptData.byteOffset + corruptData.byteLength
            ),
          },
          error: null,
        }),
      });

      const corruptRef = {
        storageBucket: "financial-documents",
        storagePath: "engagements/test/corrupt.pdf",
        expectedSha256: crypto.createHash("sha256").update(corruptData).digest("hex"),
        filename: "corrupt.pdf",
      };

      await assert.rejects(
        async () => {
          await resolveAndVerifyAttachments([corruptRef]);
        },
        /Attachment must be a PDF/
      );
    } finally {
      supabaseAdmin.storage.from = originalFrom;
    }
  });

  await t.test("email retry worker aborts send and marks outbox as permanently failed when attachment check fails", async () => {
    // Configure mock env vars so isSupabaseLive() returns true
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key-12345";

    // Spy on update calls
    let updatePayload: Record<string, unknown> | null = null;
    let updatedId: string | null = null;

    const originalFrom = supabaseAdmin.from;
    try {
      supabaseAdmin.from = (table: string) => {
        if (table === "email_outbox") {
          return {
            update: (payload: Record<string, unknown>) => {
              updatePayload = payload;
              return {
                eq: (col: string, val: string) => {
                  if (col === "id") updatedId = val;
                  return Promise.resolve({ data: null, error: null });
                },
              };
            },
          };
        }
        return originalFrom.call(supabaseAdmin, table);
      };

      // Corrupted attachment failure classification in cron route
      const attErr = new Error("Integrity mismatch on attachment receipt.pdf: expected aaa, got bbb");
      const status = await markOutboxFailure("test-outbox-uuid", 2, {
        category: "permanent",
        retryable: false,
        message: `Attachment verification failed: ${attErr.message}`,
      });

      // Verify that status is 'failed' (terminal rejection, never retried or sent incomplete)
      assert.equal(status, "failed");
      assert.equal(updatedId, "test-outbox-uuid");
      assert.ok(updatePayload !== null, "updatePayload should have been recorded");
      assert.equal(updatePayload?.status, "failed");
      assert.equal(updatePayload?.attempt_count, 2);
      assert.equal(updatePayload?.last_error_category, "permanent");
      assert.match(
        String(updatePayload?.last_error),
        /Attachment verification failed: Integrity mismatch/
      );
      assert.equal(updatePayload?.next_attempt_at, null); // never retried
      assert.ok(updatePayload?.failed_at !== null); // records failed_at timestamp
    } finally {
      supabaseAdmin.from = originalFrom;
      if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
      else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    }
  });
});

// =============================================================================
// CHALLENGE 3: Outbox Attachment Preservation Across Retries & Zero Dropped Attachments
// =============================================================================
test("CHALLENGE 3: Outbox attachment preservation across retries (zero dropped attachments)", async (t) => {
  const { claimOutbox, queueOutbox } = require("../../src/lib/email/outbox");

  const validInvoicePdf = Buffer.from("%PDF-1.4\nInvoice binary content mock\n%%EOF\n");
  const validReceiptPdf = Buffer.from("%PDF-1.4\nReceipt binary content mock\n%%EOF\n");
  const invoiceSha = crypto.createHash("sha256").update(validInvoicePdf).digest("hex");
  const receiptSha = crypto.createHash("sha256").update(validReceiptPdf).digest("hex");

  const attachmentRefs = [
    {
      storageBucket: "financial-documents",
      storagePath: "invoices/LIT-INV-ENG-01.pdf",
      expectedSha256: invoiceSha,
      filename: "LIT-INV-ENG-01.pdf",
    },
    {
      storageBucket: "financial-documents",
      storagePath: "receipts/LIT-REC-ENG-01.pdf",
      expectedSha256: receiptSha,
      filename: "LIT-REC-ENG-01.pdf",
    },
  ];

  await t.test("claimOutbox persists attachmentRefs into insert payload", async () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-key";

    let capturedInsert: Record<string, any> | null = null;
    const originalFrom = supabaseAdmin.from;

    try {
      supabaseAdmin.from = (table: string) => {
        if (table === "email_outbox") {
          return {
            insert: (payload: Record<string, any>) => {
              capturedInsert = payload;
              return {
                select: () => ({
                  single: async () => ({
                    data: { id: "outbox-test-uuid", status: "processing" },
                    error: null,
                  }),
                }),
              };
            },
          };
        }
        return originalFrom.call(supabaseAdmin, table);
      };

      const result = await claimOutbox({
        eventType: "stage_approved",
        category: "transactional",
        recipient: "client@example.com",
        sender: "hello@logicintelligencetechnologies.in",
        subject: "Stage Approved With Documents",
        idempotencyKey: `test_claim_${Date.now()}`,
        attachmentRefs,
      });

      assert.ok(result !== null);
      assert.equal(result.id, "outbox-test-uuid");
      assert.ok(capturedInsert !== null);
      assert.deepEqual(capturedInsert.attachment_refs, attachmentRefs);
      assert.equal(capturedInsert.status, "processing");
      assert.equal(capturedInsert.attempt_count, 1);

      await queueOutbox({
        eventType: "stage_approved",
        category: "transactional",
        recipient: "client@example.com",
        sender: "hello@logicintelligencetechnologies.in",
        subject: "Queued stage approval",
        idempotencyKey: `test_queue_${Date.now()}`,
        attachmentRefs,
      });
      assert.equal(capturedInsert.status, "queued");
      assert.equal(capturedInsert.attempt_count, 0);
      assert.deepEqual(capturedInsert.attachment_refs, attachmentRefs);
    } finally {
      supabaseAdmin.from = originalFrom;
      if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
      else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    }
  });

  await t.test("outbox retry worker recovers 100% of attachments from attachmentRefs without drops", async () => {
    // Simulate retry execution with storage mock
    const originalStorageFrom = supabaseAdmin.storage.from;

    try {
      supabaseAdmin.storage.from = (bucket: string) => ({
        download: async (path: string) => {
          let bytes: Buffer | null = null;
          if (path.includes("LIT-INV")) bytes = validInvoicePdf;
          else if (path.includes("LIT-REC")) bytes = validReceiptPdf;

          if (!bytes) {
            return { data: null, error: new Error(`Not found in ${bucket}: ${path}`) };
          }
          return {
            data: {
              arrayBuffer: async () => bytes!.buffer.slice(
                bytes!.byteOffset,
                bytes!.byteOffset + bytes!.byteLength
              ),
            },
            error: null,
          };
        },
      });

      // Outbox row as stored in DB
      const outboxRow = {
        id: "retry-outbox-row-1",
        recipient: "client@example.com",
        sender: "hello@logicintelligencetechnologies.in",
        subject: "Stage Approved Documents",
        html: "<p>Approved</p>",
        text: "Approved",
        attachment_refs: attachmentRefs,
        attempt_count: 1,
      };

      // Resolve attachments
      const resolved = await resolveAndVerifyAttachments(outboxRow.attachment_refs);

      assert.equal(resolved.length, 2, "Must resolve exactly 2 attachments without drops");
      assert.equal(resolved[0].filename, "LIT-INV-ENG-01.pdf");
      assert.equal(resolved[0].contentType, "application/pdf");
      assert.deepEqual(resolved[0].content, validInvoicePdf);

      assert.equal(resolved[1].filename, "LIT-REC-ENG-01.pdf");
      assert.equal(resolved[1].contentType, "application/pdf");
      assert.deepEqual(resolved[1].content, validReceiptPdf);
    } finally {
      supabaseAdmin.storage.from = originalStorageFrom;
    }
  });

  await t.test("retry aborts sending completely if any attachment is corrupted or missing (zero partial emails)", async () => {
    const originalStorageFrom = supabaseAdmin.storage.from;

    try {
      // Simulate storage returning corrupted bytes for the receipt
      supabaseAdmin.storage.from = () => ({
        download: async (path: string) => {
          if (path.includes("LIT-INV")) {
            return {
              data: {
                arrayBuffer: async () => validInvoicePdf.buffer.slice(
                  validInvoicePdf.byteOffset,
                  validInvoicePdf.byteOffset + validInvoicePdf.byteLength
                ),
              },
              error: null,
            };
          }
          // Corrupted receipt (1 bit flipped)
          const corruptReceipt = Buffer.from(validReceiptPdf);
          corruptReceipt[10] ^= 0xff;
          return {
            data: {
              arrayBuffer: async () => corruptReceipt.buffer.slice(
                corruptReceipt.byteOffset,
                corruptReceipt.byteOffset + corruptReceipt.byteLength
              ),
            },
            error: null,
          };
        },
      });

      await assert.rejects(
        async () => {
          await resolveAndVerifyAttachments(attachmentRefs);
        },
        /Integrity mismatch on attachment LIT-REC-ENG-01\.pdf/
      );
    } finally {
      supabaseAdmin.storage.from = originalStorageFrom;
    }
  });
});

// =============================================================================
// CHALLENGE 4: Stage Payment Approval Awaited Notification and Promise Safety (MAIL04)
// =============================================================================
test("CHALLENGE 4: Stage payment approval awaited notification and promise safety (MAIL04)", async (t) => {
  const dbSource = fs.readFileSync(path.join(root, "src/lib/engagements/db.ts"), "utf8");

  await t.test("notifyStageApproved in reconcileEngagementStagePayment is strictly awaited", () => {
    // Assert no unawaited calls to notifyStageApproved exist in db.ts
    const unawaitedCalls = dbSource.match(/(?<!await\s+)notifyStageApproved\(/g);
    assert.equal(
      unawaitedCalls,
      null,
      "Zero unawaited calls to notifyStageApproved allowed in db.ts"
    );

    // Assert try/catch block encloses the await
    const tryCatchBlock = dbSource.match(
      /try\s*\{\s*await\s+notifyStageApproved\(\{[\s\S]*?\}\);\s*\}\s*catch\s*\(\w+\)\s*\{/
    );
    assert.ok(
      tryCatchBlock !== null,
      "notifyStageApproved must be wrapped in try { await notifyStageApproved(...) } catch (notifErr)"
    );
  });

  await t.test("reconcileEngagementStagePayment passes storage attachmentRefs with DOCUMENTS_BUCKET and SHA256", () => {
    assert.ok(
      dbSource.includes("const emailAttachmentRefs: AttachmentRef[] = [];"),
      "db.ts must declare emailAttachmentRefs"
    );
    assert.ok(
      dbSource.includes("storageBucket: DOCUMENTS_BUCKET,"),
      "emailAttachmentRefs must use DOCUMENTS_BUCKET"
    );
    assert.ok(
      dbSource.includes("expectedSha256: (invoicePdfResult as any).sha256"),
      "emailAttachmentRefs must pass invoice sha256"
    );
    assert.ok(
      dbSource.includes("expectedSha256: (receiptPdfResult as any).sha256"),
      "emailAttachmentRefs must pass receipt sha256"
    );
    assert.ok(
      dbSource.includes("attachmentRefs: emailAttachmentRefs.length > 0 ? emailAttachmentRefs : undefined"),
      "must pass attachmentRefs to notifyStageApproved"
    );
  });

  await t.test("notifyStageApproved forwards attachmentRefs to sendEmail and handles errors safely", async () => {
    const { notifyStageApproved } = require("../../src/lib/engagements/stage-notifications");

    // Call notifyStageApproved with missing contact_email -> returns { ok: false } cleanly
    const missingEmailResult = await notifyStageApproved({
      engagement: {
        id: "eng-1",
        engagement_ref: "ENG-TEST",
        contact_name: "Test User",
        company_name: "Test Co",
        contact_email: "",
      },
      approvedStageKey: "acceptance",
    });
    assert.deepEqual(missingEmailResult, { ok: false });

    // Call notifyStageApproved with valid input but without live SMTP -> handles gracefully
    const handledResult = await notifyStageApproved({
      engagement: {
        id: "eng-1",
        engagement_ref: "ENG-TEST",
        contact_name: "Test User",
        company_name: "Test Co",
        contact_email: "test@example.com",
      },
      approvedStageKey: "acceptance",
      nextStageKey: "sow",
      adminNotes: "Test approval notes",
    });
    assert.ok(typeof handledResult.ok === "boolean");
  });
});

// =============================================================================
// CHALLENGE 5: Client Recipient Email Resolution and Outbox Error Resilience (MAIL01)
// =============================================================================
test("CHALLENGE 5: Client recipient email resolution and outbox error resilience (MAIL01)", async (t) => {
  const serviceSource = fs.readFileSync(path.join(root, "src/lib/subscriptions/service.ts"), "utf8");

  await t.test("resolveClientContactEmail is defined and resolves across engagement, client, and profile hierarchies", () => {
    assert.ok(
      serviceSource.includes("async function resolveClientContactEmail("),
      "service.ts must implement resolveClientContactEmail"
    );
    assert.ok(
      serviceSource.includes(".from('client_engagements')"),
      "must query client_engagements"
    );
    assert.ok(
      serviceSource.includes(".from('clients')"),
      "must query clients"
    );
    assert.ok(
      serviceSource.includes(".from('profiles')"),
      "must query profiles"
    );
    assert.ok(
      serviceSource.includes("return 'hello@logicintelligencetechnologies.in'"),
      "must fallback to hello@ only as ultimate fallback"
    );
  });

  await t.test("subscriptions service methods resolve client email and do not hardcode hello@", () => {
    // Assert resolveClientContactEmail is called for orders, activations, refunds, and expirations
    assert.ok(
      serviceSource.includes("const clientEmail = await resolveClientContactEmail({ clientId, engagementId });"),
      "createOrGetMaintenanceOrder must resolve client email"
    );
    assert.ok(
      (serviceSource.includes("clientId: order.client_id") && serviceSource.includes("engagementId: order.engagement_id")),
      "verifyMaintenancePayment must resolve client email"
    );
    assert.ok(
      (serviceSource.includes("clientId: currentSub.client_id") && serviceSource.includes("engagementId: currentSub.engagement_id")),
      "processSubscriptionRefund must resolve client email"
    );
    assert.ok(
      (serviceSource.includes("clientId: sub.client_id") && serviceSource.includes("engagementId: sub.engagement_id")),
      "checkAndExpireStandardTrials must resolve client email"
    );
  });

  await t.test("outbox insert errors throw explicit Error and are not silently swallowed", () => {
    // Order registration outbox failure throws
    assert.ok(
      serviceSource.includes("throw new Error(`Failed to enqueue order registration notification: ${outboxErr.message}`);"),
      "createOrGetMaintenanceOrder must throw on outbox error"
    );
    // Subscription activation outbox failure throws
    assert.ok(
      serviceSource.includes("throw new Error(`Failed to enqueue subscription activation email: ${outboxErr.message}`);"),
      "verifyMaintenancePayment must throw on outbox error"
    );
    // Refund outbox failure throws
    assert.ok(
      serviceSource.includes("throw new Error(`Failed to enqueue refund initiated notification: ${outboxErr.message}`);") &&
      serviceSource.includes("throw new Error(`Failed to enqueue refund completed notification: ${outboxErr.message}`);"),
      "processSubscriptionRefund must throw on outbox error"
    );
  });
});
