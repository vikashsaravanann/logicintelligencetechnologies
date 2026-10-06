import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { MORE_NAV_GROUPS, PRIMARY_NAV } from "../../src/config/navigation.ts";

const APP_DIR = path.join(process.cwd(), "src/app");

/** URL of every static page.tsx under src/app (route groups stripped, dynamic routes skipped). */
function staticPageUrls(dir = APP_DIR, segments: string[] = []): string[] {
  const urls: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isFile() && e.name === "page.tsx") urls.push("/" + segments.join("/"));
    if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith("[") || (dir === APP_DIR && e.name === "api")) continue;
    const seg = /^\(.*\)$/.test(e.name) ? [] : [e.name];
    urls.push(...staticPageUrls(path.join(dir, e.name), [...segments, ...seg]));
  }
  return urls;
}

/** Signed-in areas, one-off flow pages and duplicate URLs that are not menu destinations. */
const NOT_IN_MENU = [
  /^\/(admin|client|dashboard|omni|profile)(\/|$)/,
  /^\/(login|reset-password|unsubscribe|offline)$/,
  /^\/booking\//,
  /^\/onboard$/, // token-gated client onboarding flow, not a menu page
  /^\/auth(\/|$)/,
  /^\/privacy-policy$/, // same content as /privacy
  /^\/terms-of-service$/, // same content as /terms
  /^\/voice-shield\/demo$/, // same page as /voice-shield/request
];

const menuHrefs = new Set([...PRIMARY_NAV, ...MORE_NAV_GROUPS.flatMap((g) => g.items)].map((i) => i.href));

test("every public page is reachable from the header menus", () => {
  const pages = staticPageUrls().filter((u) => !NOT_IN_MENU.some((re) => re.test(u)));
  assert.ok(pages.length > 40, `expected many public pages, found ${pages.length}`);
  const missing = pages.filter((u) => !menuHrefs.has(u)).sort();
  assert.deepEqual(missing, [], `pages missing from the More menu: ${missing.join(", ")}`);
});

test("every menu link points at a page that exists", () => {
  const pages = new Set(staticPageUrls());
  const dead = [...menuHrefs].filter((h) => !pages.has(h));
  assert.deepEqual(dead, [], `menu links with no page: ${dead.join(", ")}`);
});

test("no page is listed twice in the More menu", () => {
  const all = MORE_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
  const dupes = all.filter((h, i) => all.indexOf(h) !== i);
  assert.deepEqual(dupes, []);
});
