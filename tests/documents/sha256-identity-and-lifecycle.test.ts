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
import crypto from "node:crypto";
import { SHA256_REGEX, isValidSha256 } from "../../src/lib/payments/calculations";

const { resolveAndVerifyAttachments, preparePdfAttachment, isPdfBuffer } = require("../../src/lib/email/attachments");
const { supabaseAdmin } = require("../../src/lib/supabase/admin");

test("SHA256 Hash Identity Across Storage, Preview, and Email Attachments", async (t) => {
  // Generate realistic PDF buffer
  const samplePdfBytes = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Title (Milestone 4 Official Invoice) >>\nendobj\ntrailer\n<< /Size 2 >>\nstartxref\n50\n%%EOF\n"
  );
  const authoritativeSha256 = crypto.createHash("sha256").update(samplePdfBytes).digest("hex");

  await t.test("1. Cryptographic SHA-256 format validation", () => {
    assert.equal(authoritativeSha256.length, 64);
    assert.match(authoritativeSha256, SHA256_REGEX);
    assert.equal(isValidSha256(authoritativeSha256), true);

    // Rejection of invalid hashes
    assert.equal(isValidSha256(""), false);
    assert.equal(isValidSha256("short-hash"), false);
    assert.equal(isValidSha256(authoritativeSha256.slice(0, 63)), false);
    assert.equal(isValidSha256(authoritativeSha256 + "a"), false);
    assert.equal(isValidSha256("zzzz" + authoritativeSha256.slice(4)), false);
  });

  await t.test("2. Attachment packaging preserves SHA-256 without byte modification", () => {
    const attachment = preparePdfAttachment("LIT-INV-ENG-01", samplePdfBytes);
    assert.equal(attachment.filename, "LIT-INV-ENG-01.pdf");
    assert.equal(attachment.contentType, "application/pdf");
    assert.deepEqual(attachment.content, samplePdfBytes);

    const packagedSha = crypto.createHash("sha256").update(attachment.content).digest("hex");
    assert.equal(packagedSha, authoritativeSha256);
  });

  await t.test("3. Storage round-trip and hash identity verification", async () => {
    const originalFrom = supabaseAdmin.storage.from;

    try {
      // Mock storage returning the exact uploaded buffer
      supabaseAdmin.storage.from = (bucket: string) => ({
        download: async (path: string) => {
          assert.equal(bucket, "documents");
          assert.ok(path.startsWith("financial/"));
          return {
            data: {
              arrayBuffer: async () => samplePdfBytes.buffer.slice(
                samplePdfBytes.byteOffset,
                samplePdfBytes.byteOffset + samplePdfBytes.byteLength
              ),
            },
            error: null,
          };
        },
      });

      const ref = {
        storageBucket: "documents",
        storagePath: "financial/invoices/LIT-INV-ENG-01.pdf",
        expectedSha256: authoritativeSha256,
        filename: "LIT-INV-ENG-01.pdf",
      };

      const resolved = await resolveAndVerifyAttachments([ref]);
      assert.equal(resolved.length, 1);
      assert.equal(resolved[0].filename, "LIT-INV-ENG-01.pdf");
      assert.deepEqual(resolved[0].content, samplePdfBytes);

      // Verify that the resolved attachment's hash is identical to authoritativeSha256
      const resolvedSha = crypto.createHash("sha256").update(resolved[0].content).digest("hex");
      assert.equal(resolvedSha, authoritativeSha256);
    } finally {
      supabaseAdmin.storage.from = originalFrom;
    }
  });

  await t.test("4. Tamper detection: 1-bit flip in storage buffer triggers hash mismatch rejection", async () => {
    const originalFrom = supabaseAdmin.storage.from;

    try {
      // Tamper with 1 byte in the PDF buffer
      const tamperedBytes = Buffer.from(samplePdfBytes);
      tamperedBytes[20] ^= 0x01; // flip 1 bit

      const tamperedSha = crypto.createHash("sha256").update(tamperedBytes).digest("hex");
      assert.notEqual(tamperedSha, authoritativeSha256);

      supabaseAdmin.storage.from = () => ({
        download: async () => ({
          data: {
            arrayBuffer: async () => tamperedBytes.buffer.slice(
              tamperedBytes.byteOffset,
              tamperedBytes.byteOffset + tamperedBytes.byteLength
            ),
          },
          error: null,
        }),
      });

      const ref = {
        storageBucket: "documents",
        storagePath: "financial/invoices/LIT-INV-ENG-01.pdf",
        expectedSha256: authoritativeSha256,
        filename: "LIT-INV-ENG-01.pdf",
      };

      await assert.rejects(
        async () => {
          await resolveAndVerifyAttachments([ref]);
        },
        (err: Error) => {
          assert.match(err.message, /Integrity mismatch on attachment LIT-INV-ENG-01\.pdf/);
          assert.match(err.message, new RegExp(`expected ${authoritativeSha256}`));
          assert.match(err.message, new RegExp(`got ${tamperedSha}`));
          return true;
        }
      );
    } finally {
      supabaseAdmin.storage.from = originalFrom;
    }
  });

  await t.test("5. Case-insensitivity of hex SHA-256 comparison", async () => {
    const originalFrom = supabaseAdmin.storage.from;

    try {
      supabaseAdmin.storage.from = () => ({
        download: async () => ({
          data: {
            arrayBuffer: async () => samplePdfBytes.buffer.slice(
              samplePdfBytes.byteOffset,
              samplePdfBytes.byteOffset + samplePdfBytes.byteLength
            ),
          },
          error: null,
        }),
      });

      // Upper case expected hash
      const upperRef = {
        storageBucket: "documents",
        storagePath: "financial/invoices/LIT-INV-ENG-01.pdf",
        expectedSha256: authoritativeSha256.toUpperCase(),
        filename: "LIT-INV-ENG-01.pdf",
      };

      const resolved = await resolveAndVerifyAttachments([upperRef]);
      assert.equal(resolved.length, 1);
      assert.deepEqual(resolved[0].content, samplePdfBytes);
    } finally {
      supabaseAdmin.storage.from = originalFrom;
    }
  });
});
