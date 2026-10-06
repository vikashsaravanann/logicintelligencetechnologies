import { test } from "node:test";
import assert from "node:assert/strict";
import { intakeSchema, MAX_INTAKE_BYTES } from "@/lib/onboarding/intake-schema";

const valid = {
  company: { legalName: "Acme Logistics" },
  contact: { name: "Priya", email: "priya@example.com" },
  project: {},
  access: {},
  confirmation: { noSecretsConfirmed: true, authorized: true },
};

test("accepts a minimal valid intake", () => {
  assert.ok(intakeSchema.safeParse(valid).success);
});

test("rejects unknown keys (strict)", () => {
  const r = intakeSchema.safeParse({ ...valid, extra: "nope" });
  assert.ok(!r.success);
});

test("rejects unknown nested keys (strict)", () => {
  const r = intakeSchema.safeParse({ ...valid, company: { legalName: "Acme", password: "x" } });
  assert.ok(!r.success);
});

test("requires confirmation literals to be true", () => {
  assert.ok(!intakeSchema.safeParse({ ...valid, confirmation: { noSecretsConfirmed: false, authorized: true } }).success);
  assert.ok(!intakeSchema.safeParse({ ...valid, confirmation: { noSecretsConfirmed: true, authorized: false } }).success);
});

test("requires a valid contact email and non-empty legal name", () => {
  assert.ok(!intakeSchema.safeParse({ ...valid, contact: { name: "P", email: "not-an-email" } }).success);
  assert.ok(!intakeSchema.safeParse({ ...valid, company: { legalName: "" } }).success);
});

test("URL fields must be https", () => {
  assert.ok(!intakeSchema.safeParse({ ...valid, company: { ...valid.company, website: "http://insecure.example" } }).success);
  assert.ok(intakeSchema.safeParse({ ...valid, company: { ...valid.company, website: "https://acme.example" } }).success);
});

test("array URL fields are https and bounded", () => {
  assert.ok(intakeSchema.safeParse({ ...valid, project: { existingUrls: ["https://a.example"] } }).success);
  assert.ok(!intakeSchema.safeParse({ ...valid, project: { existingUrls: ["http://a.example"] } }).success);
  assert.ok(!intakeSchema.safeParse({ ...valid, project: { existingUrls: Array(21).fill("https://a.example") } }).success);
});

test("MAX_INTAKE_BYTES is 64KB", () => {
  assert.equal(MAX_INTAKE_BYTES, 64 * 1024);
});
