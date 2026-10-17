import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ADMIN_NAV_GROUPS, allNavHrefs, navForRole } from "../../src/config/admin-nav.ts";
import { CAPABILITIES, STAFF_ROLES } from "../../src/config/roles.ts";

const ADMIN_DIR = path.join(process.cwd(), "src/app/admin");

/** Static admin page routes (no dynamic [param] segments). */
function adminPageRoutes(dir = ADMIN_DIR, segs: string[] = []): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isFile() && e.name === "page.tsx") out.push("/admin/" + segs.join("/"));
    if (!e.isDirectory() || e.name.startsWith("[") || e.name === "components") continue;
    out.push(...adminPageRoutes(path.join(dir, e.name), [...segs, e.name]));
  }
  return out.map((r) => r.replace(/\/$/, "")).map((r) => (r === "/admin" ? "/admin" : r));
}

// Pages intentionally not in the nav, each with a reason.
const NAV_HIDDEN: Record<string, string> = {
  "/admin": "redirects to command-center",
  "/admin/forbidden": "shown on capability denial",
  "/admin/email-preview": "reached from the Emails page (Template Gallery)",
  "/admin/emails/new": "reached from the Emails page",
  "/admin/emails/mailboxes": "reached from the Emails page",
  "/admin/emails/outbox": "reached from the Emails page",
  "/admin/proposals/new": "reached from the Proposals page",
  "/admin/quotations/new": "reached from the Quotations page",
  "/admin/quotations/catalog": "reached from the Quotations page",
  "/admin/quotations/coupons": "reached from the Quotations page",
  "/admin/engagements/new": "reached from Engagements",
  "/admin/workspaces/new": "reached from Staff Workspaces",
  "/admin/invoices/new": "reached from the Invoices page",
  "/admin/clients/[id]": "reached from Clients",
  "/admin/checklists": "redirects to /admin/checklist-invitations",
  "/admin/documents/[id]": "reached from Documents",
  "/admin/contracts/[id]/record-signature": "reached from a client's contracts",
  "/admin/automations/catalog": "reached from Automations",
  "/admin/automations/connectors": "reached from Automations",
  "/admin/automations/dead-letter": "reached from Automations",
  "/admin/automations/deployments": "reached from Automations",
  "/admin/automations/events": "reached from Automations",
  "/admin/automations/executions": "reached from Automations",
  "/admin/automations/n8n": "reached from Automations",
  "/admin/automations/schedules": "reached from Automations",
  "/admin/automations/site-health": "reached from Automations",
  "/admin/automations/workflows": "reached from Automations",
  "/admin/seo/sitemaps": "reached from SEO & Indexing",
  "/admin/seo/sites": "reached from SEO & Indexing",
  "/admin/seo/url-inspection": "reached from SEO & Indexing",
  "/admin/seo/schedules": "reached from SEO & Indexing",
  "/admin/cdn/cache-jobs": "reached from Edge CDN",
};

test("every nav href resolves to an existing admin page", () => {
  const routes = new Set(adminPageRoutes());
  for (const href of allNavHrefs()) {
    assert.ok(routes.has(href), `nav href ${href} has no page.tsx`);
  }
});

test("every static admin page is in the nav or explicitly hidden", () => {
  const navHrefs = new Set(allNavHrefs());
  for (const route of adminPageRoutes()) {
    assert.ok(navHrefs.has(route) || route in NAV_HIDDEN, `page ${route} missing from nav`);
  }
});

test("every nav capability exists", () => {
  const caps = new Set<string>(CAPABILITIES);
  for (const g of ADMIN_NAV_GROUPS) {
    for (const i of g.items) assert.ok(caps.has(i.capability), `unknown capability ${i.capability}`);
  }
});

test("navForRole filters to capable items and drops empty groups", () => {
  const viewer = navForRole("viewer");
  const allLabels = viewer.flatMap((g) => g.items.map((i) => i.label));
  assert.ok(allLabels.includes("Command Center"));
  assert.ok(!allLabels.includes("Team"), "viewer must not see Team");
  for (const g of viewer) assert.ok(g.items.length > 0, "empty group not dropped");
  // super_admin sees Team
  assert.ok(navForRole("super_admin").flatMap((g) => g.items.map((i) => i.label)).includes("Team"));
});

test("no nav href is listed twice", () => {
  const hrefs = allNavHrefs();
  assert.deepEqual(hrefs.filter((h, i) => hrefs.indexOf(h) !== i), []);
});
