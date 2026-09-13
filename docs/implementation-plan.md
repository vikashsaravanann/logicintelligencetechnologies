# Implementation Plan & Delivery Checklist

**Company:** Logic Intelligence Technologies  
**Target Domain:** https://www.logicintelligencetechnologies.in  

---

## Phase 1: Quality Baseline & Security Stabilization
- [x] Run linting, typechecking, and existing unit tests.
- [x] Verify no hardcoded secrets exist in source files.
- [x] Validate SSRF, email header sanitization, and token verification test suites.
- [x] Implement safe environment verification script (`scripts/verify-environment.mjs`).

## Phase 2: Design System & Navigation Unification
- [x] Build reusable, context-aware `<BackButton />` in `src/components/navigation/BackButton.tsx`.
- [x] Update `src/components/ui/back-to-home.tsx` to wrap and align with `BackButton`.
- [x] Implement accessible `<MoreMenu />` with keyboard escape handling and click-outside dismissal.
- [x] Implement `<MobileMenu />` with drawer animations, accessible headings, and touch targets.
- [x] Implement `<RouteAnnouncer />` for screen reader live region announcements and focus management.
- [x] Implement `<GlassSurface />` with solid fallbacks and WebKit backdrop-filter support.
- [x] Implement structural page primitives: `PageShell`, `PageHeader`, `PageSection`, `ContentContainer`, `SectionHeading`, `RelatedContent`, `FinalCTA`.

## Phase 3: Route Migration & Profile Architecture Simplification
- [x] Establish `/profile` as the single canonical authenticated profile destination.
- [x] Maintain `/login` as the single canonical authentication gateway.
- [x] Add permanent HTTP 301/308 redirects in `next.config.ts` for `/client/profile` -> `/profile` and `/client/login` -> `/login`.
- [x] Implement server redirect in `src/app/client/profile/page.tsx`.
- [x] Implement server redirect in `src/app/client/login/page.tsx`.
- [x] Update client layout navigation to point to `/profile`.
- [x] Eliminate duplicate UI and unify profile tabs (Personal details, security, vault, billing, projects, tickets).

## Phase 4: Media System & Founder Authority
- [x] Create media components: `ResponsiveImage`, `HeroImage`, `FounderImage`, `ServiceImage`, `CaseStudyImage`, `SocialPreviewImage`, `ImageFallback`.
- [x] Generate and verify WebP images for Vikash Saravanan (`vikash-saravanan-profile.webp`, `vikash-saravanan-profile-square.webp`, `vikash-saravanan-banner.webp`, `vikash-saravanan-og.webp`).
- [x] Update founder configuration in `src/config/founder.ts` and `src/config/company.ts`.
- [x] Ensure founder page back button routes to `/about` with label "Back to About".

## Phase 5: PDF System & Resource Center
- [x] Verify all 12 corporate PDFs exist in `public/resources/` with valid `%PDF-1.4` headers.
- [x] Implement `scripts/verify-pdfs.mjs` and wire to `npm run verify:pdfs`.
- [x] Verify `/resources` and individual resource slug pages render correctly with download links.

## Phase 6: Testing & CI/CD Workflows
- [x] Unit tests for navigation mappings and column allowlists.
- [x] Verification scripts in `package.json`: `verify:environment`, `verify:pdfs`, `verify:links`, `smoke:test`, `test:security`.
- [x] GitHub Actions workflows: `ci.yml`, `production.yml`, `preview.yml`, `security.yml`, `rollback.yml`.
- [x] Smoke test script for custom domain verification (`scripts/smoke-test.mjs`).

## Phase 7: Deployment & Custom Domain Verification
- [x] Verify full build passes with `npm run build`.
- [x] Verify typecheck passes with `npm run typecheck`.
- [x] Verify tests pass with `npm run test`.
- [x] Commit changes with semantic message and push to GitHub `origin main`.
- [x] Trigger Vercel production deployment and verify custom domain `https://www.logicintelligencetechnologies.in`.
