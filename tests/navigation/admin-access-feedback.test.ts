import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const middleware = fs.readFileSync("src/middleware.ts", "utf8");
const login = fs.readFileSync("src/app/(auth)/login/page.tsx", "utf8");

test("an unconfirmed signed-in account is not bounced between /login and /admin", () => {
  // middleware tags the redirect...
  assert.ok(middleware.includes('loginUrl.searchParams.set("reason", "confirm-email")'));
  // ...and /login explains instead of redirecting a session it cannot use.
  const effect = login.slice(login.indexOf("supabase.auth.getSession()"), login.indexOf("router.replace(safeNextPath() || \"/\");"));
  assert.ok(effect.includes("email_confirmed_at"), "login must check confirmation before redirecting");
  assert.ok(effect.includes("setServerError("), "login must tell the user why");
});

test("a signed-in account without the admin role is told why", () => {
  assert.ok(middleware.includes('"/profile?notice=admin-required"'));
  assert.ok(fs.readFileSync("src/lib/auth/require-admin.ts", "utf8").includes('"/profile?notice=admin-required"'));
  assert.ok(fs.readFileSync("src/app/(portal)/profile/page.tsx", "utf8").includes('notice === "admin-required"'));
});
