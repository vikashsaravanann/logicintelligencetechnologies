import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isCompanyOnlyPath, isProtectedPath, isPublicPath } from "../../src/lib/routing/public-paths.ts";

const APP_DIR = path.join(process.cwd(), "src/app");
const MARKETING_DIR = path.join(APP_DIR, "(marketing)");

/** URL of every page.tsx under src/app, with route groups stripped. */
function pageUrls(dir = APP_DIR, segments: string[] = []): string[] {
  const urls: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isFile() && e.name === "page.tsx") urls.push("/" + segments.join("/"));
    if (!e.isDirectory() || e.name.startsWith("_") || e.name === "api") continue;
    const seg = /^\(.*\)$/.test(e.name) ? [] : [e.name.replace(/^\[+\.*|\]+$/g, "x")];
    urls.push(...pageUrls(path.join(dir, e.name), [...segments, ...seg]));
  }
  return urls;
}

function hasPage(dir: string): boolean {
  if (fs.existsSync(path.join(dir, "page.tsx"))) return true;
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .some((e) => e.isDirectory() && hasPage(path.join(dir, e.name)));
}

test("homepage / is public", () => {
  assert.equal(isPublicPath("/"), true, "/ must be public");
  assert.equal(isProtectedPath("/"), false, "/ must not be protected");
  assert.equal(isCompanyOnlyPath("/"), false, "/ must not be company-only");
});

test("essential system and auth entrypoints remain public", () => {
  for (const p of [
    "/login",
    "/reset-password",
    "/auth/callback",
    "/api/chat",
    "/unsubscribe",
    "/_next/static/chunks/main.js",
    "/assets/logo.png",
    "/images/hero.webp",
    "/favicon.ico",
    "/icon.png",
    "/apple-touch-icon.png",
    "/sitemap.xml",
    "/robots.txt",
    "/manifest.webmanifest",
  ]) {
    assert.equal(isPublicPath(p), true, `${p} should be public`);
    assert.equal(isProtectedPath(p), false, `${p} must not be protected`);
  }
});

test("every page in the (marketing) route group is public", () => {
  const routes = fs
    .readdirSync(MARKETING_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !/^[[(_]/.test(e.name))
    .filter((e) => hasPage(path.join(MARKETING_DIR, e.name)))
    .map((e) => `/${e.name}`);

  assert.ok(routes.length > 20, `expected many marketing routes, found ${routes.length}`);
  const locked = routes.filter((r) => !isPublicPath(r));
  assert.deepEqual(locked, [], `marketing routes redirected to /login: ${locked.join(", ")}`);

  const protectedRoutes = routes.filter((r) => isProtectedPath(r));
  assert.deepEqual(protectedRoutes, [], `marketing routes must not be protected: ${protectedRoutes.join(", ")}`);
});

test("public pages outside the (marketing) group stay reachable", () => {
  for (const p of ["/pricing", "/security", "/company/facts", "/ai", "/onboard"]) {
    assert.equal(isPublicPath(p), true, `${p} should be public`);
    assert.equal(isProtectedPath(p), false, `${p} must not be protected`);
  }
});

test("authenticated areas stay behind login", () => {
  for (const p of ["/admin", "/admin/leads", "/dashboard", "/client/dashboard", "/profile"]) {
    assert.equal(isPublicPath(p), false, `${p} must not be public`);
    assert.equal(isProtectedPath(p), true, `${p} must be protected`);
  }
});

test("/admin and /dashboard are company-only", () => {
  assert.equal(isCompanyOnlyPath("/admin"), true, "/admin must be company-only");
  assert.equal(isCompanyOnlyPath("/admin/leads"), true, "/admin/leads must be company-only");
  assert.equal(isCompanyOnlyPath("/dashboard"), true, "/dashboard must be company-only");
  assert.equal(isCompanyOnlyPath("/dashboard/analytics"), true, "/dashboard/analytics must be company-only");

  for (const p of ["/", "/profile", "/client/dashboard", "/about", "/services", "/pricing", "/administrator"]) {
    assert.equal(isCompanyOnlyPath(p), false, `${p} is not company-only`);
  }
});

test("every page is classified public or protected (no unlisted private page)", () => {
  const urls = pageUrls();
  assert.ok(urls.length > 60, `expected many pages, found ${urls.length}`);

  // No unclassified pages
  const unclassified = urls.filter((u) => !isPublicPath(u) && !isProtectedPath(u));
  assert.deepEqual(unclassified, [], `add to PUBLIC_MARKETING_PREFIXES or PROTECTED_PREFIXES: ${unclassified.join(", ")}`);

  // No pages listed as both public and protected
  const both = urls.filter((u) => isPublicPath(u) && isProtectedPath(u));
  assert.deepEqual(both, [], `listed as both public and protected: ${both.join(", ")}`);
});

test("prefix matching does not leak lookalike paths", () => {
  const lookalikes = [
    "/aboutx",
    "/pricing-admin",
    "/services-fake",
    "/adminx",
    "/dashboardx",
    "/profile-test",
  ];
  for (const p of lookalikes) {
    assert.equal(isPublicPath(p), false, `${p} must not be public`);
    assert.equal(isProtectedPath(p), false, `${p} must not be protected`);
  }
});

test("protected matching survives encoding, case, slash tricks, and malformed encoding", () => {
  for (const p of [
    "/%61dmin",
    "/ADMIN/leads",
    "//admin",
    "/dashboard%2Fleads",
    "/%E0%A4%A", // malformed URI encoding: fails closed
  ]) {
    assert.equal(isProtectedPath(p), true, `${p} must be protected`);
  }
  for (const p of ["/does-not-exist", "/adminx", "/reply-drafter.html", "/about", "/services"]) {
    assert.equal(isProtectedPath(p), false, `${p} is not a signed-in area`);
  }
});

test("company-only check survives encoding, case tricks, and malformed encoding", () => {
  for (const p of ["/admin", "/%61dmin/leads", "/Dashboard", "//admin", "/%E0%A4%A"]) {
    assert.equal(isCompanyOnlyPath(p), true, `${p} must be company-only`);
  }
  for (const p of ["/profile", "/client/dashboard", "/about", "/services", "/pricing", "/administrator"]) {
    assert.equal(isCompanyOnlyPath(p), false, `${p} is not company-only`);
  }
});
