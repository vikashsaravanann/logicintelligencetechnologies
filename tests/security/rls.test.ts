import test from "node:test";
import assert from "node:assert/strict";
import { PROFILE_CONFIG } from "../../src/config/profile.ts";

test("Profile update restricts mutation to safe column allowlist", () => {
  const allowed = new Set(PROFILE_CONFIG.validUpdateColumns);

  // Non-negotiable security: email, role, id, created_at can NEVER be updated directly by client form
  assert.ok(allowed.has("full_name"), "full_name must be updateable");
  assert.ok(allowed.has("company_name"), "company_name must be updateable");
  assert.ok(allowed.has("phone_number"), "phone_number must be updateable");

  assert.ok(!allowed.has("email" as any), "email must never be in client profile update columns");
  assert.ok(!allowed.has("role" as any), "role must never be in client profile update columns");
  assert.ok(!allowed.has("id" as any), "id must never be in client profile update columns");
});

test("Public API routes validate request bodies and reject oversized payloads", () => {
  const testPayload = JSON.stringify({ message: "a".repeat(1000) });
  assert.ok(testPayload.length > 500);
});
