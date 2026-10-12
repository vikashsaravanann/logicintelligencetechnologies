# Automation Program File Lock Registry
**Program:** Logic Intelligence Technologies (LIT) Four-Site Unified Automation Command Center  
**Coordinator:** A00 Master Orchestration  
**Status:** ACTIVE LOCKS ACROSS 26 AGENT ROLES  

| Agent ID | Role | Repository / Scope | Exclusively Locked Paths | Lock State |
|---|---|---|---|---|
| A00 | Master Orchestrator | `logicintelligencetechnologies` | `docs/automation-program/LOCKS.md`, `REQUIREMENT_TRACEABILITY.csv`, `README.md` | ACTIVE |
| A01 | Architecture & Schema | `logicintelligencetechnologies` | `docs/automation-program/WORKFLOW_EVENT_SCHEMA.md`, `src/lib/automations/schema.sql` | ACTIVE |
| A02 | Corporate Inventory & Catalog | `logicintelligencetechnologies` | `docs/automation-program/SOURCE_AND_LIVE_INVENTORY.md`, `src/config/automation.ts` | ACTIVE |
| A03 | Healthcare Workflow Specialist | `lit-smart-hospital-platform` | `automation/n8n/workflows/HC-*` | ACTIVE (Subagent 42566d87) |
| A04 | Logic Voice Workflow Specialist | `logic-voice` | `automation/n8n/workflows/LV-*`, `server/logic_voice/automation/` | ACTIVE (Subagent 33235846) |
| A05 | VoiceShield Workflow Specialist | `voice-shield` | `automation/n8n/workflows/VS-*`, `tests/workflows.test.ts` | ACTIVE (Subagent 4fd36450) |
| A06 | n8n API Client & Adaptor | `logicintelligencetechnologies` | `src/lib/automations/n8n-client.ts`, `src/lib/automations/n8n-core.ts` | ACTIVE |
| A07 | Central DB Schema & Migrations | `logicintelligencetechnologies` | `supabase/migrations/20261012_automation_command_center.sql` | ACTIVE |
| A08 | Admin Summary & Visuals | `logicintelligencetechnologies` | `src/app/admin/automations/page.tsx`, `src/app/admin/command-center/page.tsx` | ACTIVE |
| A09 | Workflow Catalog & Graph Viewer | `logicintelligencetechnologies` | `src/app/admin/automations/catalog/*`, `src/app/admin/automations/workflows/*` | ACTIVE |
| A10 | Executions & Schedules | `logicintelligencetechnologies` | `src/app/admin/automations/executions/*`, `src/app/admin/automations/schedules/*`, `events/*`, `dead-letter/*` | ACTIVE |
| A11 | Approvals & Governance | `logicintelligencetechnologies` | `src/app/admin/automations/approvals/*`, `connectors/*`, `n8n/*`, `deployments/*`, `site-health/*`, `reports/*`, `governance/*` | ACTIVE |
| A12 | Corporate SEO & Sitemap | `logicintelligencetechnologies` | `src/app/sitemap.ts`, `src/app/robots.ts` | ACTIVE |
| A13 | Healthcare SEO & Sitemap | `lit-smart-hospital-platform` | `apps/landing/public/sitemap.xml`, `apps/landing/public/robots.txt` | ACTIVE (Subagent 42566d87) |
| A14 | Logic Voice SEO & Sitemap | `logic-voice` | `apps/web/public/sitemap.xml`, `apps/web/public/robots.txt` | ACTIVE (Subagent 33235846) |
| A15 | VoiceShield SEO & Sitemap | `voice-shield` | `app/sitemap.ts`, `app/robots.ts` | ACTIVE (Subagent 4fd36450) |
| A16 | Google Search Console Client | `logicintelligencetechnologies` | `src/lib/seo/gsc-client.ts`, `docs/automation-program/GSC_OAUTH_AND_QUOTA_RUNBOOK.md` | ACTIVE |
| A17 | 72-Hour SEO Scheduler Engine | `logicintelligencetechnologies` | `src/lib/seo/scheduler.ts`, `automation/n8n/workflows/SEO-72H-ORCHESTRATOR.json` | ACTIVE |
| A18 | CDN & Edge Client | `logicintelligencetechnologies` | `src/lib/cdn/edge-client.ts`, `docs/automation-program/CDN_CACHE_FRESHNESS_AND_INVALIDATION_RUNBOOK.md` | ACTIVE |
| A19 | SEO & CDN Admin UX | `logicintelligencetechnologies` | `src/app/admin/seo/*`, `src/app/admin/cdn/*` | ACTIVE |
| A20 | Cross-Site Shared Ops Workflows | `logicintelligencetechnologies` | `automation/n8n/workflows/OPS-*` | ACTIVE |
| A21 | Security, Signatures & Isolation | `logicintelligencetechnologies` | `scripts/activate-safe-n8n-workflows.mjs`, `scripts/activate-all-n8n-workflows.mjs` | ACTIVE |
| A22 | Independent Security Reviewer | All Repos | `docs/automation-program/QA_SECURITY_RESULTS.md` | ACTIVE |
| A23 | E2E Browser & QA Specialist | `logicintelligencetechnologies` | `tests/admin/automations-e2e.test.ts`, `docs/automation-program/ADMIN_PAGE_ACCEPTANCE_MATRIX.csv` | ACTIVE |
| A24 | Release & Deployment Staging | `logicintelligencetechnologies` | `docs/automation-program/DEPLOYMENT_AND_ROLLBACK.md`, `PRODUCTION_APPROVAL_REQUEST.md` | ACTIVE |
| A25 | Documentation & Operations | `logicintelligencetechnologies` | `docs/automation-program/FINAL_PRODUCTION_EVIDENCE_REPORT.md` | ACTIVE |
