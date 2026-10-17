import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = (path: string) => fs.readFileSync(path, "utf8");

test("P0 Security Containment: auth callback never auto-elevates corporate domain users to super_admin", () => {
  const code = source("src/app/auth/callback/route.ts");
  // Auto-promotion vulnerability patterns must NOT exist
  assert.ok(!code.includes('role: "super_admin"'), "Must not set super_admin in auth callback");
  assert.ok(!code.includes('endsWith("@logicintelligencetechnologies.in")'), "Must not auto-elevate based on domain");
  assert.ok(!code.includes('isSuperAdminEmail'), "Must not use email string matching to elevate in auth callback");
  // Must safely ensure profile exists with role: 'user' without overwriting existing roles
  assert.ok(code.includes('role: "user"'), "Must default newly initialized profile to user role");
});

test("P0 Security Containment: require-admin resolves role strictly from database profile, not email allowlist", () => {
  const code = source("src/lib/auth/require-admin.ts");
  assert.ok(!code.includes("SUPER_ADMINS.includes"), "Must not bypass role check via email allowlist");
  assert.ok(!code.includes('createwithvikash@gmail.com"'), "Must not hardcode email strings in require-admin");
  assert.ok(code.includes('select("role")'), "Must query database profiles table for authoritative role");
});

test("P0 Security Containment: is-super-admin strictly checks database profiles.role === 'super_admin'", () => {
  const code = source("src/lib/auth/is-super-admin.ts");
  assert.ok(!code.includes("SUPER_ADMIN_EMAILS.includes"), "Must not bypass role check via email allowlist in is-super-admin");
  assert.ok(code.includes('profile.role === "super_admin"'), "Must verify profiles.role === 'super_admin'");
});

test("P0 Security Containment: automation secret headers never grant human super_admin identity in requireAdminApi", () => {
  const code = source("src/lib/auth/require-admin.ts");
  // Machine secret returns system_agent, never human super_admin
  assert.ok(!code.includes('adminSecret && token === adminSecret) {\n        return { ok: true, userId: "system-agent", email: "system@logicintelligencetechnologies.in", role: "super_admin" }'), "Shared token must not grant human super_admin");
  assert.ok(code.includes('role: "system_agent"'), "Machine token must grant system_agent, not super_admin");
});
