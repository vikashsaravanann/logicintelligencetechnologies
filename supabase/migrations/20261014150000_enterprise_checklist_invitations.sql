-- Migration: 20261014150000_enterprise_checklist_invitations.sql
-- Description: Core schema for 50-Point Enterprise Deployment Checklist Client Selection Lifecycle.
-- Conforms to Command Center least-privilege service_role-only RLS standard.

BEGIN;

-- 1. enterprise_checklist_versions
CREATE TABLE IF NOT EXISTS public.enterprise_checklist_versions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_title      text NOT NULL DEFAULT 'The 50-Point Enterprise Deployment Checklist',
  document_version    text NOT NULL UNIQUE,
  source_pdf_path     text NOT NULL DEFAULT 'private/resources/website-development-checklist.pdf',
  source_pdf_sha256   text NOT NULL,
  checkpoint_count    integer NOT NULL DEFAULT 50 CHECK (checkpoint_count = 50),
  phase_count         integer NOT NULL DEFAULT 8 CHECK (phase_count = 8),
  is_active           boolean NOT NULL DEFAULT true,
  approved_at         timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.enterprise_checklist_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_checklist_versions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS enterprise_checklist_versions_service ON public.enterprise_checklist_versions;
CREATE POLICY enterprise_checklist_versions_service ON public.enterprise_checklist_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.enterprise_checklist_versions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.enterprise_checklist_versions TO service_role;

-- 2. enterprise_checklist_items
CREATE TABLE IF NOT EXISTS public.enterprise_checklist_items (
  version_id              uuid NOT NULL REFERENCES public.enterprise_checklist_versions(id) ON DELETE CASCADE,
  point_number            integer NOT NULL CHECK (point_number >= 1 AND point_number <= 50),
  phase_number            integer NOT NULL CHECK (phase_number >= 1 AND phase_number <= 8),
  phase_title             text NOT NULL,
  title                   text NOT NULL,
  engineering_requirement text NOT NULL,
  acceptance_criteria     text NOT NULL,
  verification_evidence   text NOT NULL,
  pdf_page                integer NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (version_id, point_number)
);

ALTER TABLE public.enterprise_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_checklist_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS enterprise_checklist_items_service ON public.enterprise_checklist_items;
CREATE POLICY enterprise_checklist_items_service ON public.enterprise_checklist_items FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.enterprise_checklist_items FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.enterprise_checklist_items TO service_role;

-- 3. enterprise_checklist_invitations
CREATE TABLE IF NOT EXISTS public.enterprise_checklist_invitations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  recipient_name      text NOT NULL,
  recipient_email     text NOT NULL,
  recipient_company   text,
  version_id          uuid NOT NULL REFERENCES public.enterprise_checklist_versions(id),
  token_hash          text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  status              text NOT NULL DEFAULT 'issued'
                        CHECK (status IN ('draft', 'issued', 'sent', 'viewed', 'submitted', 'reviewed', 'proposal_prepared', 'proposal_sent', 'expired', 'revoked')),
  expires_at          timestamptz NOT NULL,
  sent_at             timestamptz,
  sent_count          integer NOT NULL DEFAULT 0,
  viewed_at           timestamptz,
  submitted_at        timestamptz,
  revoked_at          timestamptz,
  proposal_id         uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  created_by          text,
  internal_notes      text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checklist_invitations_token ON public.enterprise_checklist_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_checklist_invitations_status ON public.enterprise_checklist_invitations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_invitations_email ON public.enterprise_checklist_invitations(recipient_email);

ALTER TABLE public.enterprise_checklist_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_checklist_invitations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS enterprise_checklist_invitations_service ON public.enterprise_checklist_invitations;
CREATE POLICY enterprise_checklist_invitations_service ON public.enterprise_checklist_invitations FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.enterprise_checklist_invitations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_checklist_invitations TO service_role;

-- 4. enterprise_checklist_responses
CREATE TABLE IF NOT EXISTS public.enterprise_checklist_responses (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id           uuid NOT NULL UNIQUE REFERENCES public.enterprise_checklist_invitations(id) ON DELETE CASCADE,
  version_id              uuid NOT NULL REFERENCES public.enterprise_checklist_versions(id),
  confirmation_reference  text NOT NULL UNIQUE,
  submitted_by_name       text NOT NULL,
  selected_count          integer NOT NULL CHECK (selected_count >= 1 AND selected_count <= 50),
  client_notes            text,
  submitted_at            timestamptz NOT NULL DEFAULT now(),
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.enterprise_checklist_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_checklist_responses FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS enterprise_checklist_responses_service ON public.enterprise_checklist_responses;
CREATE POLICY enterprise_checklist_responses_service ON public.enterprise_checklist_responses FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.enterprise_checklist_responses FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_checklist_responses TO service_role;

-- 5. enterprise_checklist_response_items
CREATE TABLE IF NOT EXISTS public.enterprise_checklist_response_items (
  response_id             uuid NOT NULL REFERENCES public.enterprise_checklist_responses(id) ON DELETE CASCADE,
  version_id              uuid NOT NULL,
  point_number            integer NOT NULL CHECK (point_number >= 1 AND point_number <= 50),
  created_at              timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (response_id, point_number),
  FOREIGN KEY (version_id, point_number) REFERENCES public.enterprise_checklist_items(version_id, point_number) ON DELETE CASCADE
);

ALTER TABLE public.enterprise_checklist_response_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_checklist_response_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS enterprise_checklist_response_items_service ON public.enterprise_checklist_response_items;
CREATE POLICY enterprise_checklist_response_items_service ON public.enterprise_checklist_response_items FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.enterprise_checklist_response_items FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_checklist_response_items TO service_role;

-- 6. enterprise_checklist_reviews
CREATE TABLE IF NOT EXISTS public.enterprise_checklist_reviews (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id             uuid NOT NULL UNIQUE REFERENCES public.enterprise_checklist_responses(id) ON DELETE CASCADE,
  reviewer_email          text NOT NULL,
  review_status           text NOT NULL DEFAULT 'reviewed' CHECK (review_status IN ('pending', 'reviewed', 'clarification_requested', 'scope_confirmed')),
  internal_notes          text,
  reviewed_at             timestamptz NOT NULL DEFAULT now(),
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.enterprise_checklist_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_checklist_reviews FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS enterprise_checklist_reviews_service ON public.enterprise_checklist_reviews;
CREATE POLICY enterprise_checklist_reviews_service ON public.enterprise_checklist_reviews FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.enterprise_checklist_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_checklist_reviews TO service_role;

-- 7. Seed Version 1.0 and All 50 Checkpoints
DO $$
DECLARE
  v_version_id uuid;
BEGIN
  INSERT INTO public.enterprise_checklist_versions (
    document_title,
    document_version,
    source_pdf_path,
    source_pdf_sha256,
    checkpoint_count,
    phase_count,
    is_active
  ) VALUES (
    'The 50-Point Enterprise Deployment Checklist',
    '1.0',
    'private/resources/website-development-checklist.pdf',
    '32a114705c56eaf06686d677af51c86ce6bd586b724a01cf1ab4bbb26f988404',
    50,
    8,
    true
  )
  ON CONFLICT (document_version) DO UPDATE
    SET source_pdf_sha256 = EXCLUDED.source_pdf_sha256,
        is_active = true
  RETURNING id INTO v_version_id;

  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 1, 1, 'Architecture & Scope Validation', 'Architecture & Requirements Baseline', 'Produce a documented system architecture covering frontend applications, backend services, databases, authentication, external APIs, network boundaries and deployment targets, with functional and non-functional requirements (performance, availability, data sensitivity) traced to it.', 'An approved architecture document exists with current diagrams, a requirements traceability matrix, named non-functional targets and an identified dependency list; scope is signed off by the technical lead.', 'Architecture document and diagrams, the traceability matrix, and the dated scope approval in the project record.', 4
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 2, 1, 'Architecture & Scope Validation', 'GitHub Repository & Branch Protection', 'Define the repository strategy (monorepo or multirepo), set CODEOWNERS, protect the main and release branches, and require passing status checks and pull-request review before merge; adopt a release-tagging convention.', 'main cannot be pushed to directly; merges require at least one approving review and green required checks; releases are tagged; repository access follows least privilege.', 'Branch-protection settings, CODEOWNERS file, a sample merged pull request showing enforced reviews/checks, and the repository access list.', 4
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 3, 1, 'Architecture & Scope Validation', 'Environment Separation (Dev / Staging / Production)', 'Provision isolated development, staging and production environments with environment-scoped secrets, independent deployment targets and distinct data stores so non-production code cannot write to production records.', 'Each environment has its own configuration and credentials; a staging action cannot create or modify a production row; promotion between environments is explicit and controlled.', 'Environment configuration matrix, secret-scope settings per environment, and a test showing a staging write does not reach production data.', 4
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 4, 1, 'Architecture & Scope Validation', 'Cloud Infrastructure & Account Provisioning', 'Verify ownership and configuration of Vercel projects, Render services, Supabase projects, DNS, required service accounts and billing limits, with an explicit mapping between environments, repositories, services and domains.', 'Every environment maps to a known project, service, repository and domain under LIT-controlled accounts with billing limits set; no orphaned or personal-account resources serve production.', 'The environment-to-service mapping table, provider project/service identifiers, DNS ownership records, and configured billing/spend limits.', 5
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 5, 1, 'Architecture & Scope Validation', 'Technical Risk & Dependency Assessment', 'Maintain a register of external-service dependencies, operational risks, expected traffic, data sensitivity, availability requirements, expected costs and mitigations, including failure scenarios and recovery ownership.', 'Each external dependency has a documented failure mode, mitigation and named owner; availability and cost expectations are recorded and agreed.', 'The risk and dependency register with owners, mitigations and recovery responsibilities. 2 P H A S E 2', 5
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 6, 2, 'Frontend Engineering & UX', 'Next.js & React Production Architecture', 'Validate the rendering strategy (server vs client boundaries), route structure, error boundaries, caching and metadata configuration, and confirm a clean production build. Where Next.js 16 is adopted, use its supported application architecture and build requirements.', 'A production build completes without errors or disallowed warnings; server/client boundaries are deliberate; error boundaries and metadata are present on key routes.', 'The production build log, the route/rendering map, and a review of error-boundary and metadata configuration.', 5
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 7, 2, 'Frontend Engineering & UX', 'TypeScript & Component Architecture', 'Enforce strict TypeScript, reusable typed components, explicit interface contracts, predictable state management and validation of external data at boundaries; avoid unsafe any and unvalidated inputs.', 'The type-check passes in strict mode with no new errors; shared components have typed props; external responses are validated before use.', 'The strict type-check (tsc) output in CI, and a code review of component interfaces and boundary validation.', 6
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 8, 2, 'Frontend Engineering & UX', 'Tailwind Design Tokens & Brand Consistency', 'Define a central design system — typography, spacing, colour, components, responsive breakpoints, visual states and accessible contrast — as reusable tokens rather than values duplicated across pages.', 'Colour, type and spacing come from shared tokens; components reuse them; text/background pairs meet contrast targets; no ad-hoc hard-coded style values on key screens.', 'The design-token/config source, and a review showing components consuming tokens plus contrast-check results.', 6
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 9, 2, 'Frontend Engineering & UX', 'Responsive & Cross-Browser Compatibility', 'Test navigation, forms, tables, dialogs, animations and interactive elements at representative desktop, tablet and mobile viewports across the supported browser set.', 'Key journeys render and function correctly at each defined breakpoint on each supported browser, with no broken layout, overflow or inoperable control.', 'A device/browser test matrix with pass/fail per journey and screenshots of the key breakpoints.', 6
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 10, 2, 'Frontend Engineering & UX', 'Core Web Vitals & Frontend Performance', 'Measure Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift against documented thresholds, and verify image optimization, JavaScript bundle budgets, caching and route-loading behaviour.', 'Key pages meet the project’s stated LCP, INP and CLS thresholds in real-browser measurement; bundle sizes are within budget; images are optimized.', 'Lab and/or field Web Vitals reports for key routes, and the bundle-analysis output against the defined budget.', 7
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 11, 2, 'Frontend Engineering & UX', 'Accessibility & Inclusive Interaction', 'Apply WCAG 2.2 AA-oriented checks: keyboard navigation, screen-reader names, form-error association, focus management, contrast, reduced-motion support and responsive text scaling, combining automated and manual testing.', 'Important journeys are fully operable by keyboard and screen reader; automated checks report no critical violations; focus order and error messaging are correct.', 'Automated accessibility scan results plus a manual audit record for the primary journeys.', 7
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 12, 2, 'Frontend Engineering & UX', 'Forms, API Wiring & User Feedback', 'Every production form validates inputs, submits to an authorized backend, persists where required, guards against duplicate submission and shows truthful success or failure states reflecting the real result.', 'Submitting a form creates the expected backend record and routes to its operational destination; failures are shown as failures; a success message is never displayed without persistence.', 'A staging submission trace from form to stored record/notification, and a test confirming failure states on a forced backend error.', 7
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 13, 3, 'Backend & Database Integrity', 'FastAPI Service Architecture & API Contracts', 'Verify FastAPI routing, request/response schemas, status codes, authentication dependencies, exception handling and generated OpenAPI documentation, with contracts agreed between frontend and backend.', 'Endpoints validate against declared schemas, return correct status codes, enforce auth dependencies and return structured errors; the OpenAPI spec matches the implemented contract.', 'The OpenAPI document, schema/validation tests, and a review of auth dependencies and error handlers.', 8
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 14, 3, 'Backend & Database Integrity', 'PostgreSQL Schema Design & Referential Integrity', 'Model data with correctly typed identifiers, primary and foreign keys, constraints and indexes, normalized where appropriate, and manage changes through versioned migrations.', 'The deployed schema matches migrations; foreign-key and uniqueness constraints are enforced; lookup columns are indexed; no orphaned references exist in test data.', 'Migration history, a schema diff against the database, and constraint/integrity test results.', 8
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 15, 3, 'Backend & Database Integrity', 'Supabase Row-Level Security & Tenant Isolation', 'Define explicit Row-Level Security policies for every table exposed through Supabase APIs, enforcing least privilege and tenant separation, and keep the service-role key server-side only.', 'A user from one tenant cannot read or write another tenant’s rows via the API; privileged functions are protected; the service-role key never reaches the browser.', 'The RLS policy definitions, a cross-tenant access test (expected denials), and confirmation the service-role key is absent from client bundles.', 8
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 16, 3, 'Backend & Database Integrity', 'Connection Pooling & Resource Management', 'Configure connection pooling, connection lifecycle, transaction timeouts, retry behaviour and connection limits appropriate to the serverless/container hosting model.', 'Under expected concurrency the service stays within connection limits without exhaustion; timeouts and retries behave as configured.', 'Pooler configuration, and a concurrency test report showing connection counts and error rates within limits.', 9
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 17, 3, 'Backend & Database Integrity', 'Idempotent Operations & Duplicate Prevention', 'Apply idempotency keys, unique constraints and transactional processing so retries of critical submissions, payment events, provisioning actions and background jobs do not create duplicates.', 'Replaying the same request or event produces exactly one effect; concurrent duplicates are rejected or de-duplicated.', 'An idempotency test (duplicate/retried requests), and the unique-constraint definitions on the affected tables.', 9
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 18, 3, 'Backend & Database Integrity', 'Transaction Integrity, Backup & Recovery', 'Verify ACID transaction boundaries, scheduled backups, a tested restoration procedure and migration-rollback planning; a successful backup is not treated as proof of recoverability.', 'A backup can be restored into a usable environment and verified; transaction boundaries prevent partial writes; a migration can be rolled back.', 'A dated restore-test record showing data verified after restore, plus the backup schedule and rollback plan.', 9
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 19, 3, 'Backend & Database Integrity', 'Server-Side Validation & Auditability', 'Validate all API inputs on the server, generate authoritative identifiers server-side, and emit durable audit events for privileged operations; never rely on frontend-only persistence or success.', 'Invalid inputs are rejected server-side; identifiers are server-generated; privileged actions produce audit records with actor, action and timestamp.', 'Validation test cases, and sample audit-log entries for privileged operations. 4 P H A S E 4', 10
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 20, 4, 'AI & Data Pipeline Integration', 'AI Provider Selection & Credential Management', 'Document the chosen model provider(s) — for example an approved Meta model API service or Google Vertex AI — and verify credentials, model availability, quotas, regional requirements and failure handling.', 'The provider and model are recorded with region and quota; credentials are stored securely; the system degrades gracefully when the provider errors or is rate-limited.', 'The provider/model configuration record, secret-store references, and a test of provider-failure handling.', 10
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 21, 4, 'AI & Data Pipeline Integration', 'Knowledge Ingestion & Data Provenance', 'Ingest only authorized documents, with validation, source metadata, content checksums, duplicate detection, update handling and deletion procedures; do not fabricate or pad the corpus.', 'Every ingested item has a verifiable source and checksum; duplicates are detected; updates and deletions propagate to the index.', 'The ingestion log with sources and checksums, and a deletion/update test showing the index reflects the change.', 10
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 22, 4, 'AI & Data Pipeline Integration', 'pgvector Semantic Search & Index Validation', 'Where semantic retrieval is used, validate embedding generation, vector dimensions, the pgvector schema, the chosen vector index and both search accuracy and query performance.', 'Embedding dimensions match the index; retrieval returns relevant results on a labelled set above the project’s relevance threshold; query latency is within target.', 'A retrieval benchmark with relevance scores and latency, and the pgvector schema/index definition.', 11
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 23, 4, 'AI & Data Pipeline Integration', 'Retrieval-Augmented Generation Architecture', 'Implement document chunking, retrieval ranking, permission filtering, source attribution, context assembly and citation integrity so the assistant cannot surface content a user is not authorized to see.', 'Answers cite retrieved sources accurately; permission filters exclude unauthorized documents from context; citations resolve to real passages.', 'A permission-filtering test (authorized vs unauthorized user on the same query), and a citation-integrity review.', 11
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 24, 4, 'AI & Data Pipeline Integration', 'Prompt Injection & Tool-Use Protection', 'Separate trusted instructions from retrieved content, test for prompt injection, enforce tool permissions and require confirmation gates for consequential actions; untrusted documents must not override authorization.', 'Injection attempts embedded in documents do not change system behaviour or trigger unauthorized tool use; consequential actions require explicit confirmation.', 'A prompt-injection test suite with results, and the tool-permission and confirmation-gate configuration.', 11
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 25, 4, 'AI & Data Pipeline Integration', 'AI Response Quality & Factual Verification', 'Maintain evaluation datasets covering factual accuracy, completeness, consistency, citation quality and hallucination resistance; time-sensitive facts must come from appropriately fresh, verifiable sources.', 'The model meets the project’s stated quality thresholds on the evaluation set; unsupported claims and stale facts are caught by the evaluation.', 'The evaluation dataset and scored results, including hallucination and citation-quality metrics.', 12
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 26, 4, 'AI & Data Pipeline Integration', 'AI Latency, Streaming & Resource Optimization', 'Measure time to first token, completion time, retrieval latency, model execution time and error rates; apply streaming, bounded context windows, caching and resource controls, and define per-application SLOs.', 'Measured latencies meet the application-specific SLOs; streaming is used where appropriate; context size and cost stay within bounds.', 'A latency/throughput report against the defined SLOs, and the streaming/context/caching configuration.', 12
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 27, 4, 'AI & Data Pipeline Integration', 'AI Privacy, Memory & Retention Controls', 'Control storage of conversation history with consent where appropriate, per-user isolation, retention policies and deletion; where zero-retention is required, verify both application behaviour and the provider’s contractual and technical retention settings.', 'Conversation data is isolated per user and retained/deleted per policy; a deletion request removes the data; any zero-retention claim is backed by the provider’s configured settings.', 'The retention policy, a user-data deletion test, and the provider’s documented retention/opt-out configuration.', 12
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 28, 5, 'Telephony & Real-Time WebSockets (If Applicable)', 'Audio Capture, Sampling & Encoding Validation', 'For speech pipelines, verify microphone capture, sampling-rate conversion (for example 16 kHz mono PCM where the selected STT provider requires it), frame sizes, encoding and handling of invalid audio; do not force 16 kHz when the provider contract specifies another format.', 'Audio reaches the STT provider in its required format; malformed audio is handled without crashing; the sampling rate matches the provider contract.', 'The audio-pipeline configuration, and a test log showing accepted formats and graceful handling of invalid input.', 13
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 29, 5, 'Telephony & Real-Time WebSockets (If Applicable)', 'Non-Blocking Real-Time Audio Pipeline', 'Ensure non-blocking I/O, bounded asyncio.Queue (or equivalent) handling, backpressure management, defined queue-overflow behaviour and no blocking work inside latency-sensitive event loops.', 'Under sustained audio the event loop is not blocked; queues stay bounded with defined overflow behaviour; no dropped-frame cascade occurs.', 'A load test of the audio path showing queue depth and loop latency, and a review confirming no blocking calls in hot paths.', 13
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 30, 5, 'Telephony & Real-Time WebSockets (If Applicable)', 'WebSocket Session Lifecycle & Reliability', 'Require authenticated session establishment, connection-health/heartbeat handling, reconnect behaviour, message sequencing, cleanup and correct behaviour when connectivity is interrupted.', 'Sessions authenticate before use; dropped connections reconnect and resume or fail cleanly; no leaked sessions remain after disconnect.', 'A connection-interruption test showing reconnect/cleanup, and the heartbeat/sequencing configuration.', 13
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 31, 5, 'Telephony & Real-Time WebSockets (If Applicable)', 'STT → LLM → TTS Orchestration', 'Validate streaming transcription, AI processing, speech generation, interruptibility, cancellation, conversation state and recovery from provider errors, measuring each stage independently.', 'A caller can interrupt and the pipeline cancels in-flight work; each stage recovers from a provider error; conversation state stays consistent.', 'Per-stage latency and error measurements, and an interruption/cancellation test record.', 14
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 32, 5, 'Telephony & Real-Time WebSockets (If Applicable)', 'End-to-End Voice Latency & Quality', 'Define and test response latency, transcription accuracy, speech quality, interruptions and jitter under realistic conditions; a sub-400 ms turnaround may be investigated for suitable streaming components where feasible, but must not be claimed end-to-end unless defined, measured and achieved under documented conditions.', 'Measured latency and quality meet the project’s documented targets under realistic load; any sub-400 ms claim is scoped to the measured component and conditions.', 'The end-to-end voice test report with latency distribution, accuracy and the conditions under which it was measured. 6 P H A S E 6', 14
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 33, 6, 'Security & Compliance', 'Authentication, Authorization & MFA', 'Verify secure login, account lifecycle, role-based permissions, MFA where appropriate, session expiry, access revocation and enforcement of authorization at backend boundaries (not only in the UI).', 'Access decisions are enforced server-side per role; sessions expire and can be revoked; MFA is available where required; revoked access takes effect immediately.', 'Authorization test cases per role, session-expiry/revocation tests, and the MFA configuration.', 14
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 34, 6, 'Security & Compliance', 'API Rate Limiting & Abuse Protection', 'Implement and test rate limits, request-size limits, bot mitigation, brute-force protection and safe throttling of expensive AI endpoints.', 'Abusive request volumes are throttled with correct status codes; oversized requests are rejected; expensive endpoints have stricter limits.', 'Rate-limit configuration and a test showing throttling behaviour and response codes under burst load.', 15
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 35, 6, 'Security & Compliance', 'Secrets Management & Credential Rotation', 'Hold credentials only in approved secret stores or deployment environments, enable repository secret scanning, minimize access, define rotation procedures and prevent secret leakage through build artifacts and logs.', 'No secrets exist in the repository or build output; secret scanning is active; a documented rotation procedure exists and access is least-privilege.', 'Secret-scanning results, the secret-store configuration, and the rotation procedure.', 15
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 36, 6, 'Security & Compliance', 'TLS, DNS, Security Headers & Transport Protection', 'Verify HTTPS with valid certificates, appropriate TLS configuration, secure cookies, HSTS where appropriate, a content security policy and essential browser security headers.', 'All traffic is HTTPS with valid certificates; security headers are present and correct; cookies are secure and scoped.', 'An external TLS/headers scan of the production domain, and the header/cookie configuration.', 15
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 37, 6, 'Security & Compliance', 'Sensitive Data Protection & Encryption', 'Require encryption in transit, encryption at rest where needed, access-controlled object storage, data minimization and retention enforcement, and document which components process sensitive data.', 'Sensitive data is encrypted in transit and at rest where required; storage access is controlled; retention is enforced; the data-flow for sensitive payloads is documented.', 'The data-flow/classification document, storage access-control settings, and encryption configuration evidence.', 15
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 38, 6, 'Security & Compliance', 'Vulnerability & Compliance Review', 'Run dependency vulnerability scanning and application security testing, cover authentication/authorization test cases, perform a privacy-impact review where appropriate, assign incident-response responsibilities and document remediation; reference regulatory frameworks only when genuinely applicable.', 'Known critical/high vulnerabilities are remediated or formally accepted; security test cases pass; incident responsibilities are assigned; no unfounded compliance claims are made.', 'The dependency-scan and security-test reports with remediation status, and the incident-response ownership record. 7 P H A S E 7', 16
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 39, 7, 'QA, Testing & Telemetry', 'Automated Unit & Integration Testing', 'Maintain unit tests, tests with mocked external dependencies, backend integration tests, database tests and frontend component tests, with project-appropriate coverage and critical-path acceptance thresholds.', 'The test suite passes in CI; coverage meets the agreed threshold; critical paths have explicit tests.', 'The CI test run and coverage report against the defined threshold.', 16
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 40, 7, 'QA, Testing & Telemetry', 'End-to-End User Journey Verification', 'Test authentication, forms, account activation, dashboard access, API interactions, notifications and any payment or AI workflows against staging, asserting real outcomes rather than only HTTP 200.', 'Each critical journey completes end to end on staging with the expected data and side effects, not merely a successful response code.', 'End-to-end test results per journey, including the resulting records/notifications verified.', 16
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 41, 7, 'QA, Testing & Telemetry', 'Error Boundaries & Failure Recovery', 'Verify frontend error boundaries, backend exception handling, retry limits, fallback states, circuit breakers and recovery when a provider is unavailable; never show simulated success when a critical dependency fails.', 'When a dependency fails, the system shows an honest failure or degraded state and recovers when the dependency returns; retries are bounded.', 'A fault-injection test record showing behaviour with a forced dependency outage and recovery.', 17
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 42, 7, 'QA, Testing & Telemetry', 'Observability, Logging & Error Monitoring', 'Implement structured logs with correlation IDs, actionable error monitoring (for example Sentry where selected), tracing where supported and incident alerts, while keeping secrets and unnecessary personal data out of logs.', 'Errors surface in monitoring with enough context to act; logs are structured and correlated; no secrets or unnecessary PII appear in logs.', 'Sample structured log entries with correlation IDs, the monitoring/alert configuration, and a log-redaction check.', 17
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 43, 7, 'QA, Testing & Telemetry', 'Performance, Load & Scalability Testing', 'Run representative performance, load, stress and concurrency tests, defining throughput, latency, resource utilization and acceptable error thresholds for realistic usage.', 'The system meets its throughput/latency targets at expected load and degrades predictably beyond it, within the defined error threshold.', 'The load-test report showing throughput, latency percentiles, resource use and error rates against targets.', 17
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 44, 7, 'QA, Testing & Telemetry', 'Security Regression & Production-Readiness Testing', 'Maintain regression tests for access control, database policies, API abuse prevention and sensitive-data exposure, and record known limitations; block release for unresolved critical issues.', 'Security regression tests pass; previously fixed issues do not recur; no unresolved critical issue remains open at release.', 'The security regression results and the open-issues list with severity and release-blocker status. 8 P H A S E 8', 18
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 45, 8, 'DevOps, CI/CD & Handoff', 'GitHub Actions CI/CD Pipeline Validation', 'Require linting, type checking, automated tests, security checks and build verification in CI, gating deployment so changes reach the production branch only after the pipeline passes.', 'A failing check blocks merge/deploy; the production branch only advances through a green pipeline; the workflow is protected from unauthorized edits.', 'The CI workflow definition and a run history showing gating on lint, types, tests, security and build.', 18
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 46, 8, 'DevOps, CI/CD & Handoff', 'Vercel Frontend Production Deployment', 'Verify project ownership, Git mapping, build settings, environment variables, the deployed commit, the production domain and post-deployment smoke tests; where Vercel is not the host, document the equivalent checks for the approved provider.', 'The production frontend serves the intended commit on the correct domain with correct environment configuration; smoke tests pass after deploy.', 'The deployment record (project, commit, domain), the environment-variable inventory, and smoke-test results.', 18
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 47, 8, 'DevOps, CI/CD & Handoff', 'Render Backend Production Deployment', 'Verify service configuration, start commands, environment configuration, database connectivity, any background workers, health checks, resource allocation and the running revision; where Render is not selected, perform the equivalent backend-hosting checks.', 'The backend runs the intended revision, connects to the database, passes health checks and has required workers running within allocated resources.', 'The service configuration, health-check status, running-revision identifier and a database-connectivity check.', 19
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 48, 8, 'DevOps, CI/CD & Handoff', 'DNS, Domains, CDN & Search Visibility', 'Verify DNS records, domain ownership, TLS certificates, redirects, canonical URLs, sitemap accessibility, robots directives and CDN behaviour, and submit to search engines where applicable, without promising indexing time or ranking.', 'The production domain resolves over valid TLS with correct redirects and canonicals; the sitemap and robots rules are correct; CDN caching behaves as intended.', 'DNS/TLS verification output, the canonical/redirect map, and the sitemap/robots configuration.', 19
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 49, 8, 'DevOps, CI/CD & Handoff', 'Rollback & Operational Monitoring', 'Maintain documented release identifiers, a tested rollback procedure, monitoring dashboards, alert routing and post-release observation, including migration-recovery considerations; test representative recovery rather than only documenting it.', 'A release can be rolled back to a known-good revision in a test; dashboards and alerts are live; post-release monitoring is defined.', 'A rollback-test record, the monitoring dashboard and alert-routing configuration, and release-identifier history.', 19
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
  INSERT INTO public.enterprise_checklist_items (
    version_id, point_number, phase_number, phase_title, title, engineering_requirement, acceptance_criteria, verification_evidence, pdf_page
  ) VALUES (
    v_version_id, 50, 8, 'DevOps, CI/CD & Handoff', 'IP, Documentation & Client Handover', 'Produce a handover inventory covering source repositories, technical documentation, API specifications, deployment architecture, approved access transfer, support responsibilities and intellectual-property terms, without disclosing passwords or private keys; define ownership and transfer per the actual contract.', 'The client receives a complete, accurate handover package; access is transferred through approved channels; IP and support terms match the signed contract; no secrets appear in the handover document.', 'The signed-off handover inventory, the access-transfer record, and the contract clause defining IP ownership and support.', 20
  ) ON CONFLICT (version_id, point_number) DO UPDATE
    SET phase_title = EXCLUDED.phase_title,
        title = EXCLUDED.title,
        engineering_requirement = EXCLUDED.engineering_requirement,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        verification_evidence = EXCLUDED.verification_evidence,
        pdf_page = EXCLUDED.pdf_page;
END $$;

COMMIT;
