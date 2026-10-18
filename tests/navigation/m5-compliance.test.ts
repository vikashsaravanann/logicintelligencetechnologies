import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isActiveNav } from "../../src/config/admin-nav.ts";
import { filterModuleCategoriesForRole } from "../../src/config/module-directory.ts";

test("NAV04: isActiveNav supports URL hash fragments and suppresses base route when hash item is active", () => {
  const allHrefs = ["/client/dashboard", "/client/dashboard#milestones"];

  // Case 1: Exact route without hash
  assert.equal(
    isActiveNav("/client/dashboard", "/client/dashboard", allHrefs, ""),
    true,
    "base route should match when no hash is present"
  );
  assert.equal(
    isActiveNav("/client/dashboard", "/client/dashboard#milestones", allHrefs, ""),
    false,
    "hash route should not match when no hash is present"
  );

  // Case 2: Exact route with matching hash #milestones
  assert.equal(
    isActiveNav("/client/dashboard", "/client/dashboard#milestones", allHrefs, "#milestones"),
    true,
    "hash route should match when currentHash is #milestones"
  );
  assert.equal(
    isActiveNav("/client/dashboard", "/client/dashboard", allHrefs, "#milestones"),
    false,
    "base route should be suppressed when a sibling hash route is active"
  );

  // Case 3: Hash alias #journey matching #milestones
  assert.equal(
    isActiveNav("/client/dashboard", "/client/dashboard#milestones", allHrefs, "#journey"),
    true,
    "hash route should match alias #journey"
  );
  assert.equal(
    isActiveNav("/client/dashboard", "/client/dashboard", allHrefs, "#journey"),
    false,
    "base route should be suppressed when alias hash route is active"
  );

  // Case 4: Other route
  assert.equal(
    isActiveNav("/client/dashboard", "/client/support", allHrefs, "#milestones"),
    false,
    "unrelated route should not match"
  );
});

test("NAV01: Portal Shell and Headers enforce pure white surfaces and unbreakable uppercase wordmark", () => {
  const portalShellPath = path.join(process.cwd(), "src/components/navigation/portal-shell.tsx");
  const portalHeaderPath = path.join(process.cwd(), "src/components/navigation/portal-header.tsx");
  const adminShellPath = path.join(process.cwd(), "src/app/admin/components/AdminShell.tsx");
  const clientLayoutPath = path.join(process.cwd(), "src/app/client/layout.tsx");

  assert.ok(fs.existsSync(portalShellPath), "portal-shell.tsx must exist");
  assert.ok(fs.existsSync(portalHeaderPath), "portal-header.tsx must exist");

  const portalHeaderContent = fs.readFileSync(portalHeaderPath, "utf-8");
  assert.match(portalHeaderContent, /bg-white/, "portal-header must use bg-white");
  assert.match(portalHeaderContent, /LOGIC INTELLIGENCE TECHNOLOGIES/, "portal-header must display brand wordmark");
  assert.match(portalHeaderContent, /whitespace-nowrap/, "brand wordmark must have whitespace-nowrap");

  const adminShellContent = fs.readFileSync(adminShellPath, "utf-8");
  assert.match(adminShellContent, /bg-white/, "AdminShell must use bg-white");
  assert.match(adminShellContent, /LOGIC INTELLIGENCE TECHNOLOGIES/, "AdminShell must display brand wordmark");

  const clientLayoutContent = fs.readFileSync(clientLayoutPath, "utf-8");
  assert.match(clientLayoutContent, /bg-white/, "client layout must use bg-white");
});

test("NAV02 & NAV03: Module Directory capability gating and /client redirect cleanliness", () => {
  // Test super_admin role
  const superAdminCats = filterModuleCategoriesForRole("super_admin");
  assert.ok(superAdminCats.length >= 8, "super_admin should see all operational categories");

  // Test viewer role
  const viewerCats = filterModuleCategoriesForRole("viewer");
  assert.ok(viewerCats.length < superAdminCats.length, "viewer should see restricted subset");

  // Verify no stale /client/workspace references
  const moduleDirContent = fs.readFileSync(
    path.join(process.cwd(), "src/config/module-directory.ts"),
    "utf-8"
  );
  assert.doesNotMatch(
    moduleDirContent,
    /\/client\/workspace/,
    "module directory must not contain stale /client/workspace references"
  );
  assert.match(
    moduleDirContent,
    /\/client\/dashboard/,
    "module directory should reference /client/dashboard"
  );

  // Verify next.config.ts has /client -> /client/dashboard redirect
  const nextConfigContent = fs.readFileSync(
    path.join(process.cwd(), "next.config.ts"),
    "utf-8"
  );
  assert.match(
    nextConfigContent,
    /source:\s*["']\/client["'],\s*destination:\s*["']\/client\/dashboard["']/,
    "next.config.ts must redirect /client to /client/dashboard"
  );
});

test("NAV02: Intake page provides 5 discrete form tabs and All Form Submissions heading", () => {
  const intakeContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/intake/page.tsx"),
    "utf-8"
  );
  assert.match(intakeContent, /All Form Submissions/, "intake page heading must be All Form Submissions");
  assert.match(intakeContent, /Contact Form/, "intake must have Contact Form tab");
  assert.match(intakeContent, /Free Demo/, "intake must have Free Demo tab");
  assert.match(intakeContent, /Discovery Questionnaire/, "intake must have Discovery Questionnaire tab");
  assert.match(intakeContent, /Checklist Submissions/, "intake must have Checklist Submissions tab");
  assert.match(intakeContent, /Consultation Bookings/, "intake must have Consultation Bookings tab");
});

test("UI01: Responsive comparison tables implement block md:hidden stacked cards and hidden md:block desktop wrappers", () => {
  const pricingContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/(marketing)/pricing/page.tsx"),
    "utf-8"
  );
  assert.match(pricingContent, /block md:hidden/, "pricing page must have mobile stacked cards");
  assert.match(pricingContent, /hidden md:block.*overflow-x-auto/, "pricing page matrix must be hidden on mobile");

  const healthcareContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/(marketing)/healthcare/plans/sections/features.tsx"),
    "utf-8"
  );
  assert.match(healthcareContent, /block md:hidden/, "healthcare features must have mobile stacked cards");
  assert.match(healthcareContent, /hidden md:block.*overflow-x-auto/, "healthcare features table must have overflow wrapper on desktop");

  const supportContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/engagement/[engagementRef]/support/SupportStageClient.tsx"),
    "utf-8"
  );
  assert.match(supportContent, /block md:hidden/, "support stage must have mobile stacked cards");
  assert.match(supportContent, /hidden md:block.*overflow-x-auto/, "support stage tables must have overflow wrappers on desktop");
});

test("UI02: Truthful database-backed states for SLA, warranty, and zero tickets", () => {
  const supportClientContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/engagement/[engagementRef]/support/SupportStageClient.tsx"),
    "utf-8"
  );
  assert.doesNotMatch(
    supportClientContent,
    /TKT-LIT-2026-001/,
    "SupportStageClient must not contain fabricated fallback ticket TKT-LIT-2026-001"
  );

  const queueTableContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/support/support-queue-table.tsx"),
    "utf-8"
  );
  assert.match(
    queueTableContent,
    /const resolvedRate = totalCount > 0 \? Math\.round\(\(resolvedCount \/ totalCount\) \* 100\) : 0;/,
    "resolvedRate must calculate 0 when totalCount is 0"
  );
  assert.match(
    queueTableContent,
    /totalCount > 0 \? `\$\{resolvedRate\}%` : "—"/,
    "support queue table must render em dash when totalCount is 0"
  );

  const engagementAdminContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/engagements/[id]/EngagementDetailAdminClient.tsx"),
    "utf-8"
  );
  assert.doesNotMatch(
    engagementAdminContent,
    /'Enterprise 24x7 Dedicated SLA'/,
    "EngagementDetailAdminClient must not claim fake Enterprise 24x7 Dedicated SLA fallback"
  );
  assert.doesNotMatch(
    engagementAdminContent,
    /'90-Day Post-Launch Warranty Active'/,
    "EngagementDetailAdminClient must not claim fake 90-Day Post-Launch Warranty fallback"
  );
  assert.match(
    engagementAdminContent,
    /snap\.slaTier \|\| 'Unassigned \/ Pending'/,
    "EngagementDetailAdminClient must display Unassigned / Pending fallback for SLA"
  );
  assert.match(
    engagementAdminContent,
    /snap\.warrantyPeriod \|\| 'Pending Acceptance'/,
    "EngagementDetailAdminClient must display Pending Acceptance fallback for warranty"
  );

  const clientSupportContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/client/support/page.tsx"),
    "utf-8"
  );
  assert.match(
    clientSupportContent,
    /Standard Warranty \/ Routine Queue/,
    "client support page must support Standard Warranty / Routine Queue"
  );
});

test("UX: Root-safe loading screen and accessible feedback animations", () => {
  const brandLoadingContent = fs.readFileSync(
    path.join(process.cwd(), "src/components/motion/brand-loading-screen.tsx"),
    "utf-8"
  );
  assert.match(
    brandLoadingContent,
    /createPortal\(content, document\.body\)/,
    "BrandLoadingScreen must mount to document.body via createPortal on client"
  );

  const initialLoaderContent = fs.readFileSync(
    path.join(process.cwd(), "src/components/motion/initial-loader.tsx"),
    "utf-8"
  );
  assert.doesNotMatch(
    initialLoaderContent,
    /550/,
    "initial-loader must not contain artificial 550ms setTimeout delay"
  );

  const supportClientContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/engagement/[engagementRef]/support/SupportStageClient.tsx"),
    "utf-8"
  );
  assert.match(
    supportClientContent,
    /role="status"\s+aria-live="polite"/,
    "ticket submission confirmation banner must have role=status and aria-live=polite"
  );
});
