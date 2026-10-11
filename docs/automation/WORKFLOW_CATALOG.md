# WORKFLOW_CATALOG.md — Complete LIT 30-Workflow Catalog

**Organization:** Logic Intelligence Technologies (LIT)  
**Lead System Engineer:** Vikash Saravanan  
**Standard Version:** 2.0  
**Scope:** 30 Orchestration Workflows across 7 Functional Tiers

---

## Tier 1 — Lead Generation & Business Intelligence (LIT-01 to LIT-08)

### LIT-01: Website Lead Capture
- **Canonical Name:** `LIT — Website Lead Capture`
- **Webhook Path:** `/webhook/lit-website-lead-capture`
- **Event Type:** `lead.website_captured`
- **Workflow File:** `LIT-01-website-lead-capture.json`
- **Trigger:** Next.js `/api/contact` or `/api/booking` form submission.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256, 300s window)
  3. `Lead normalization & domain extraction` (Syntax check, business domain detector)
  4. `IF suppression check` (Rejects disposable/suppressed domains)
  5. `Service classification tagger` (Categorizes across 15 service domains)
  6. `Sign callback` & `Callback` node (HTTP POST to `$env.LIT_CALLBACK_URL`)
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-02: Public Business Lead Discovery
- **Canonical Name:** `LIT — Public Business Lead Discovery`
- **Webhook Path:** `/webhook/lit-public-business-lead-discovery`
- **Event Type:** `lead.public_discovered`
- **Trigger:** Apify task completion or authorized directory scraper feed.
- **Key Nodes:** Verify signature -> Deduplication query against Supabase -> Company domain extraction -> Social/LinkedIn verification gate -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-03: Website and Digital Opportunity Audit
- **Canonical Name:** `LIT — Website and Digital Opportunity Audit`
- **Webhook Path:** `/webhook/lit-digital-opportunity-audit`
- **Event Type:** `lead.digital_audit_requested`
- **Trigger:** Scheduled lead batch or visitor free-audit request.
- **Key Nodes:** Verify signature -> Lighthouse Core Web Vitals probe -> Security headers audit (HSTS, CSP, SSL) -> Mobile responsiveness probe -> Audit summary synthesis -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-04: AI Lead Qualification
- **Canonical Name:** `LIT — AI Lead Qualification`
- **Webhook Path:** `/webhook/lit-ai-lead-qualification`
- **Event Type:** `lead.ai_qualified`
- **Workflow File:** `LIT-04-ai-lead-qualification.json`
- **Trigger:** Next.js `/api/cron/lead-qualification` or new lead arrival.
- **Key Nodes:**
  1. `Webhook`
  2. `Verify signature`
  3. `Extract technical signals` (Parses technical constraints, architecture hints)
  4. `Calculate 0-100 fit score` (Evaluates technical need, commercial intent, scale)
  5. `Priority assignment` (Assigns P1–P4 or INSUFFICIENT_EVIDENCE sentinel)
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-05: Personalized Outreach Drafts
- **Canonical Name:** `LIT — Personalized Outreach Drafts`
- **Webhook Path:** `/webhook/lit-personalized-outreach-drafts`
- **Event Type:** `outreach.draft_generated`
- **Trigger:** Qualified P1/P2 lead approved for draft generation.
- **Key Nodes:** Verify signature -> Evidence payload extraction -> Truthful prompt generation (Groq LLaMA-3.3 70B) -> Anti-hallucination blocker gates -> Persist draft in `outreach_drafts` with `status='pending_approval'` -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-06: Consultation Scheduling
- **Canonical Name:** `LIT — Consultation Scheduling`
- **Webhook Path:** `/webhook/lit-consultation-scheduling`
- **Event Type:** `consultation.scheduled`
- **Workflow File:** `LIT-06-consultation-scheduling.json`
- **Trigger:** Client booking form submission on website.
- **Key Nodes:**
  1. `Webhook`
  2. `Verify signature`
  3. `Slot availability check` (Validates calendar availability, avoids conflicts)
  4. `Calendar invite builder` (Generates Google Meet / Cal details)
  5. `Confirmation email dispatcher` (Sends verified invite to client & Vikash Saravanan)
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-07: Proposal Preparation
- **Canonical Name:** `LIT — Proposal Preparation`
- **Webhook Path:** `/webhook/lit-proposal-preparation`
- **Event Type:** `proposal.draft_requested`
- **Trigger:** Post-consultation discovery notes submitted by Lead Engineer.
- **Key Nodes:** Verify signature -> Package & pricing mapper (from ₹8,999 to Enterprise) -> Milestone & timeline calculator -> PDF proposal renderer -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-08: Sales Pipeline Follow-Up
- **Canonical Name:** `LIT — Sales Pipeline Follow-Up`
- **Webhook Path:** `/webhook/lit-sales-pipeline-followup`
- **Event Type:** `pipeline.followup_triggered`
- **Trigger:** Cron runner evaluating stagnant proposals (>48 hours without reply).
- **Key Nodes:** Verify signature -> Suppression check -> Follow-up sequence counter (max 3 touches) -> Opt-out detector -> Outreach queue dispatcher -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

---

## Tier 2 — Service-Specific Project Delivery (LIT-09 to LIT-15)

### LIT-09: Project Requirement Intake
- **Canonical Name:** `LIT — Project Requirement Intake`
- **Webhook Path:** `/webhook/lit-project-requirement-intake`
- **Event Type:** `project.requirement_intake`
- **Workflow File:** `LIT-09-project-requirement-intake.json`
- **Trigger:** Signed contract or client intake questionnaire submission.
- **Key Nodes:**
  1. `Webhook`
  2. `Verify signature`
  3. `Validate intake schema` (Enforces Web, App, Game, AI, SaaS, Enterprise schemas)
  4. `Synthesize milestones & architecture` (Generates M1–M4 milestones, tech stack roadmap)
  5. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-10: Project Workspace Creation
- **Canonical Name:** `LIT — Project Workspace Creation`
- **Webhook Path:** `/webhook/lit-project-workspace-creation`
- **Event Type:** `project.workspace_created`
- **Trigger:** Approved project intake.
- **Key Nodes:** Verify signature -> GitHub repository provisioning (private under `vikashsaravanann`) -> Supabase dev project / schema branching -> Linear/Jira board creation -> Slack/Discord notification -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-11: Development Milestone Tracking
- **Canonical Name:** `LIT — Development Milestone Tracking`
- **Webhook Path:** `/webhook/lit-development-milestone-tracking`
- **Event Type:** `project.milestone_updated`
- **Trigger:** GitHub PR merge to staging or manual milestone completion in Admin portal.
- **Key Nodes:** Verify signature -> Milestone progress recalculation -> Client dashboard update -> Deliverable release notification -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-12: Automated Quality Reporting
- **Canonical Name:** `LIT — Automated Quality Reporting`
- **Webhook Path:** `/webhook/lit-automated-quality-reporting`
- **Event Type:** `project.qa_completed`
- **Trigger:** CI/CD pipeline completion (unit tests, Playwright E2E, ESLint, TypeScript).
- **Key Nodes:** Verify signature -> Test coverage aggregator -> Security audit scanner -> Quality summary card formatter -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-13: Client Progress Reports
- **Canonical Name:** `LIT — Client Progress Reports`
- **Webhook Path:** `/webhook/lit-client-progress-reports`
- **Event Type:** `client.progress_report_dispatched`
- **Trigger:** Weekly cron runner (Mondays 09:00 IST).
- **Key Nodes:** Verify signature -> Active project query -> Accomplishments & next milestone summarizer -> Client email dispatch -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-14: Delivery & Handover
- **Canonical Name:** `LIT — Delivery & Handover`
- **Webhook Path:** `/webhook/lit-delivery-handover`
- **Event Type:** `project.delivered`
- **Trigger:** Final milestone sign-off by client.
- **Key Nodes:** Verify signature -> Production deployment verification -> Credential handover package generation -> Warranty period initiator (30-day bug fix window) -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-15: Maintenance & Renewal
- **Canonical Name:** `LIT — Maintenance & Renewal`
- **Webhook Path:** `/webhook/lit-maintenance-renewal`
- **Event Type:** `project.maintenance_renewal`
- **Trigger:** Cron runner (15 days prior to SLA or hosting expiration).
- **Key Nodes:** Verify signature -> SLA status checker -> Maintenance invoice generation -> Renewal reminder email -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

---

## Tier 3 — Client Relationship Automation (LIT-16 to LIT-20)

### LIT-16: Client Onboarding Journey
- **Canonical Name:** `LIT — Onboarding Submitted` (Existing Production) / `LIT — Client Onboarding Journey`
- **Webhook Path:** `/webhook/lit-onboarding-submitted`
- **Event Type:** `onboarding.submitted`
- **Workflow File:** `onboarding-submitted.json`
- **Trigger:** Client completes initial onboarding portal setup.
- **Key Nodes:** Verify signature -> Validate client legal identity -> Provision client portal login -> Welcome email dispatch -> Signed callback.
- **Status:** `VERIFIED WORKING (LIVE ON SERVER: wFom64Y44ytQItH3)`

### LIT-17: Support Ticket Routing
- **Canonical Name:** `LIT - Inbound Ticket Classification` (Existing Production) / `LIT — Support Ticket Routing`
- **Webhook Path:** `/webhook/lit-inbound-ticket-classification`
- **Event Type:** `support.ticket_created`
- **Trigger:** Inbound support ticket from `/client/support` portal.
- **Key Nodes:** Inbound webhook -> Ticket classifier -> Urgency evaluator -> Engineer assignment -> Confirmation notification.
- **Status:** `VERIFIED WORKING (LIVE ON SERVER: LITInboundTickets1)`

### LIT-18: Client Feedback & CSAT
- **Canonical Name:** `LIT — Client Feedback & CSAT`
- **Webhook Path:** `/webhook/lit-client-feedback-csat`
- **Event Type:** `client.feedback_requested`
- **Trigger:** 7 days post-handover or ticket closure.
- **Key Nodes:** Verify signature -> CSAT rating prompt dispatch -> Sentiment analyzer -> Testimonial request if rating >= 9 -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-19: Quarterly Business Review (QBR)
- **Canonical Name:** `LIT — Quarterly Business Review`
- **Webhook Path:** `/webhook/lit-quarterly-business-review`
- **Event Type:** `client.qbr_scheduled`
- **Trigger:** 90-day recurring cron for Enterprise SLA accounts.
- **Key Nodes:** Verify signature -> System uptime & performance aggregator -> ROI calculation -> QBR presentation generator -> Calendar invite -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-20: Account Retention & Churn Sentinel
- **Canonical Name:** `LIT — Account Retention Sentinel`
- **Webhook Path:** `/webhook/lit-account-retention-sentinel`
- **Event Type:** `client.churn_risk_flagged`
- **Trigger:** Telemetry detecting drop in client portal usage or unpaid invoice.
- **Key Nodes:** Verify signature -> Risk score calculation -> VIP alert to Vikash Saravanan -> Retention playbook trigger -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

---

## Tier 4 — Financial & Commercial Operations (LIT-21 to LIT-24)

### LIT-21: Contract Execution & Archival
- **Canonical Name:** `LIT — Contract Signed` (Existing Production)
- **Webhook Path:** `/webhook/lit-contract-signed`
- **Event Type:** `contract.signed`
- **Workflow File:** `contract-signed.json`
- **Trigger:** Contract signed via DocuSign/HelloSign or internal sign-off.
- **Key Nodes:** Verify signature -> Contract PDF archive to Supabase Storage -> Milestone billing initialization -> Engineering team notification.
- **Status:** `VERIFIED WORKING (LIVE ON SERVER: ELmyjI5D9MXP6kjA)`

### LIT-22: Milestone Invoice Generation
- **Canonical Name:** `LIT — Milestone Invoice Generation`
- **Webhook Path:** `/webhook/lit-milestone-invoice-generation`
- **Event Type:** `billing.milestone_invoice_created`
- **Trigger:** Milestone sign-off in Admin portal.
- **Key Nodes:** Verify signature -> Razorpay/Stripe invoice creation in INR/USD -> GST tax computation -> Client dispatch -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-23: Payment Reconciliation
- **Canonical Name:** `LIT — Payment Reconciliation`
- **Webhook Path:** `/webhook/lit-payment-reconciliation`
- **Event Type:** `billing.payment_received`
- **Trigger:** Razorpay / Stripe payment webhook.
- **Key Nodes:** Webhook signature verification -> Transaction ID reconciliation with Supabase invoice -> Project status unlocked -> Receipt generation -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-24: Overdue Payment Escalation
- **Canonical Name:** `LIT — Overdue Payment Escalation`
- **Webhook Path:** `/webhook/lit-overdue-payment-escalation`
- **Event Type:** `billing.payment_overdue`
- **Trigger:** Daily cron evaluating unpaid invoices past due date.
- **Key Nodes:** Verify signature -> Grace period calculator -> Friendly reminder (Day 3) -> Urgent notice (Day 7) -> Work pause warning (Day 14) -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

---

## Tier 5 — Internal Operations & Knowledge Base (LIT-25 to LIT-27)

### LIT-25: Company Knowledge Base Synchronization
- **Canonical Name:** `LIT — Knowledge Base Sync`
- **Webhook Path:** `/webhook/lit-knowledge-sync`
- **Event Type:** `ops.knowledge_synced`
- **Trigger:** Git commit modifying `docs/` or `src/lib/ai/company-knowledge.ts`.
- **Key Nodes:** Verify signature -> Chunk Markdown documentation -> Generate vector embeddings -> Upsert into Supabase `rag_documents` -> Invalidate AI chatbot cache.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-26: Internal Engineering Workstation Provisioning
- **Canonical Name:** `LIT — Engineering Onboarding`
- **Webhook Path:** `/webhook/lit-engineering-onboarding`
- **Event Type:** `ops.engineer_onboarded`
- **Trigger:** New staff role assigned in Supabase.
- **Key Nodes:** Verify signature -> GitHub team invite -> Vault access provisioning -> Security training checklist email -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### LIT-27: Weekly System Health & Revenue Digest
- **Canonical Name:** `LIT — Weekly Operations Digest`
- **Webhook Path:** `/webhook/lit-weekly-operations-digest`
- **Event Type:** `ops.weekly_digest_generated`
- **Trigger:** Cron runner (Sundays 20:00 IST).
- **Key Nodes:** Verify signature -> Aggregates new leads, active projects, revenue collected, uptime metrics -> Formats executive briefing -> Dispatches to Vikash Saravanan.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

---

## Tier 6 — Healthcare Platform Automation (HLT-01 to HLT-06)
*Mandatory Zero-Trust Non-PHI Perimeter Enforced.*

### HLT-01: Healthcare Demo Inquiry
- **Canonical Name:** `HLT — Healthcare Demo Inquiry`
- **Webhook Path:** `/webhook/hlt-healthcare-demo-inquiry`
- **Event Type:** `healthcare.demo_inquiry`
- **Workflow File:** `HLT-01-healthcare-demo-inquiry.json`
- **Trigger:** Hospital executive completes demo request on LIT Smart Hospital Portal.
- **Key Nodes:**
  1. `Webhook`
  2. `Verify signature`
  3. `PHI boundary check & inquiry validator` (Strict rejection if clinical PHI terms are detected)
  4. `IF non-PHI & valid`
  5. `Route to healthcare demo queue` (Calculates bed capacity priority P1–P3)
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### HLT-02: Hospital Facility Onboarding
- **Canonical Name:** `HLT — Hospital Facility Onboarding`
- **Webhook Path:** `/webhook/hlt-facility-onboarding`
- **Event Type:** `healthcare.facility_onboarded`
- **Trigger:** Hospital contract execution.
- **Key Nodes:** Verify signature -> Dedicated PostgreSQL schema / tenant creation with RLS -> Admin account provisioning -> Hardware integration spec dispatch -> Signed callback.
- **Status:** `SPECIFIED / RESTRICTED SCOPE`

### HLT-03: ABDM / ABHA Gateway Heartbeat Monitor
- **Canonical Name:** `HLT — ABDM Gateway Monitor`
- **Webhook Path:** `/webhook/hlt-abdm-gateway-monitor`
- **Event Type:** `healthcare.abdm_heartbeat`
- **Trigger:** 15-minute cron runner.
- **Key Nodes:** Verify signature -> ABHA sandbox / production endpoint health probe -> Latency measurement -> SRE alert if downtime detected -> Signed callback.
- **Status:** `SPECIFIED / RESTRICTED SCOPE`

### HLT-04: Emergency OPD / IPD Capacity Alert
- **Canonical Name:** `HLT — Bed Capacity Alert`
- **Webhook Path:** `/webhook/hlt-bed-capacity-alert`
- **Event Type:** `healthcare.capacity_alert`
- **Trigger:** Hospital occupancy exceeds 90% (Dispatched by hospital backend).
- **Key Nodes:** Verify signature -> Sanitized non-PHI telemetry parsing -> Hospital administrative staff SMS alert -> Signed callback.
- **Status:** `SPECIFIED / RESTRICTED SCOPE`

### HLT-05: Pharmacy Low-Stock Reorder Automation
- **Canonical Name:** `HLT — Pharmacy Reorder Automation`
- **Webhook Path:** `/webhook/hlt-pharmacy-reorder`
- **Event Type:** `healthcare.pharmacy_low_stock`
- **Trigger:** Drug inventory below reorder threshold.
- **Key Nodes:** Verify signature -> Supplier purchase order generation -> Hospital pharmacist approval workflow -> Signed callback.
- **Status:** `SPECIFIED / RESTRICTED SCOPE`

### HLT-06: Clinical Data Retention & Compliance Audit
- **Canonical Name:** `HLT — Compliance Audit Sentinel`
- **Webhook Path:** `/webhook/hlt-compliance-audit`
- **Event Type:** `healthcare.compliance_audit`
- **Trigger:** Monthly cron runner.
- **Key Nodes:** Verify signature -> Audits database RLS enforcement -> Checks access audit logs for unauthorized queries -> Generates HIPAA / DPDP Act compliance certificate -> Signed callback.
- **Status:** `SPECIFIED / RESTRICTED SCOPE`

---

## Tier 7 — Engineering & Operations SRE (OPS-01 to OPS-04)

### OPS-01: Deployment Failure Alert
- **Canonical Name:** `OPS — Deployment Failure Alert`
- **Webhook Path:** `/webhook/ops-deployment-failure-alert`
- **Event Type:** `ops.deployment_failed`
- **Workflow File:** `OPS-01-deployment-failure-alert.json`
- **Trigger:** GitHub Actions CI/CD failure or Vercel deployment error webhook.
- **Key Nodes:**
  1. `Webhook`
  2. `Verify signature`
  3. `Parse deployment failure & score severity` (P0_CRITICAL for production, P2 for staging)
  4. `Format incident alert card` (Summarizes commit, author, failed step, remedy)
  5. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### OPS-02: SSL Certificate & Domain Expiry Sentinel
- **Canonical Name:** `OPS — SSL & Domain Sentinel`
- **Webhook Path:** `/webhook/ops-ssl-domain-sentinel`
- **Event Type:** `ops.ssl_expiry_check`
- **Trigger:** Daily cron runner at 00:00 UTC.
- **Key Nodes:** Verify signature -> Probes all LIT corporate and client domain certificates -> Flags domains expiring in < 14 days -> Escalation alert -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### OPS-03: Database Backup & Integrity Verification
- **Canonical Name:** `OPS — Database Integrity Verification`
- **Webhook Path:** `/webhook/ops-database-integrity`
- **Event Type:** `ops.database_integrity_checked`
- **Trigger:** Daily cron runner at 03:00 UTC.
- **Key Nodes:** Verify signature -> Supabase backup snapshot verification -> Checksum validation -> Test restore probe -> Signed callback.
- **Status:** `SPECIFIED / SCHEDULED NEXT`

### OPS-04: Automation Reliability Monitor
- **Canonical Name:** `OPS — Automation Reliability Monitor`
- **Webhook Path:** `/webhook/ops-automation-reliability-monitor`
- **Event Type:** `ops.reliability_monitor`
- **Workflow File:** `OPS-04-automation-reliability-monitor.json`
- **Trigger:** 5-minute cron runner or dead-letter threshold trigger.
- **Key Nodes:**
  1. `Webhook`
  2. `Verify signature`
  3. `Analyze queue health & dead-letters` (Evaluates deadLetterCount, latency, pending retries)
  4. `Generate reliability report` (HEALTHY, DEGRADED, or CRITICAL state)
  5. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`
