# WORKFLOW_CATALOG.md — Complete LIT Master Automation Workflow Catalog

**Organization:** Logic Intelligence Technologies (LIT)  
**Founder & Lead System Engineer:** Vikash Saravanan  
**Standard Version:** 2.0  
**Scope:** 37 Production & Orchestration Workflows across 7 Functional Tiers  
**Status:** `ALL 37 WORKFLOWS IMPLEMENTED & VERIFIED WORKING`

---

## Baseline Production Workflows

### PROD-01: Contract Signed
- **Canonical Name:** `LIT — Contract Signed`
- **Webhook Path:** `/webhook/lit-contract-signed`
- **Event Type:** `contract.signed`
- **Workflow File:** `contract-signed.json`
- **Trigger:** Contract signed via client portal or administrative sign-off.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256, 300s window)
  3. `Archive contract document`
  4. `Initialize milestone billing`
  5. `Notify engineering team`
  6. `Sign callback` & `Callback` (HTTP POST to `$env.LIT_CALLBACK_URL`)
- **Status:** `IMPLEMENTED & VERIFIED WORKING (Production ELmyjI5D9MXP6kjA)`

### PROD-02: Onboarding Submitted
- **Canonical Name:** `LIT — Onboarding Submitted`
- **Webhook Path:** `/webhook/lit-onboarding-submitted`
- **Event Type:** `onboarding.submitted`
- **Workflow File:** `onboarding-submitted.json`
- **Trigger:** Client completes onboarding intake questionnaire.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256, 300s window)
  3. `Validate client identity`
  4. `Provision client portal credentials`
  5. `Dispatch welcome onboarding email`
  6. `Sign callback` & `Callback` (HTTP POST to `$env.LIT_CALLBACK_URL`)
- **Status:** `IMPLEMENTED & VERIFIED WORKING (Production wFom64Y44ytQItH3)`

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
  6. `Sign callback` & `Callback` (HTTP POST to `$env.LIT_CALLBACK_URL`)
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-02: Public Business Lead Discovery
- **Canonical Name:** `LIT — Public Business Lead Discovery`
- **Webhook Path:** `/webhook/lit-public-business-lead-discovery`
- **Event Type:** `lead.public_discovered`
- **Workflow File:** `LIT-02-public-business-lead-discovery.json`
- **Trigger:** Apify task completion or authorized directory scraper feed.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Validate discovery payload` (Source URL, timestamp, public entity details)
  4. `Extract tech signals`
  5. `Deduplication check` (Supabase query against existing leads)
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-03: Website and Digital Opportunity Audit
- **Canonical Name:** `LIT — Website and Digital Opportunity Audit`
- **Webhook Path:** `/webhook/lit-digital-opportunity-audit`
- **Event Type:** `lead.digital_audit_requested`
- **Workflow File:** `LIT-03-digital-opportunity-audit.json`
- **Trigger:** Scheduled lead batch or visitor free-audit request.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Synthesize synthetic Lighthouse audit` (Core Web Vitals, performance score)
  4. `Audit security headers & SSL` (HSTS, CSP, TLS certificates)
  5. `Compile digital opportunity brief`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-04: AI Lead Qualification
- **Canonical Name:** `LIT — AI Lead Qualification`
- **Webhook Path:** `/webhook/lit-ai-lead-qualification`
- **Event Type:** `lead.ai_qualified`
- **Workflow File:** `LIT-04-ai-lead-qualification.json`
- **Trigger:** Next.js `/api/cron/lead-qualification` or new lead arrival.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Extract technical signals` (Parses technical constraints, architecture hints)
  4. `Calculate 0-100 fit score` (Evaluates technical need, commercial intent, scale)
  5. `Priority assignment` (Assigns P1–P4 or INSUFFICIENT_EVIDENCE sentinel)
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-05: Personalized Outreach Drafts
- **Canonical Name:** `LIT — Personalized Outreach Drafts`
- **Webhook Path:** `/webhook/lit-personalized-outreach-drafts`
- **Event Type:** `outreach.draft_generated`
- **Workflow File:** `LIT-05-personalized-outreach-drafts.json`
- **Trigger:** Qualified P1/P2 lead approved for draft generation.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Assemble evidence payload` (Verified facts only, anti-hallucination gates)
  4. `Synthesize personalized draft` (Fixed-price packages, free prototype demo)
  5. `Store draft pending human approval` (`outreach_drafts` with `status='pending_approval'`)
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-06: Consultation Scheduling
- **Canonical Name:** `LIT — Consultation Scheduling`
- **Webhook Path:** `/webhook/lit-consultation-scheduling`
- **Event Type:** `consultation.scheduled`
- **Workflow File:** `LIT-06-consultation-scheduling.json`
- **Trigger:** Client booking form submission on website.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Slot availability check` (Validates calendar availability, avoids conflicts)
  4. `Calendar invite builder` (Generates Google Meet / Cal details)
  5. `Confirmation email dispatcher` (Sends verified invite to client & Vikash Saravanan)
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-07: Proposal Preparation
- **Canonical Name:** `LIT — Proposal Preparation`
- **Webhook Path:** `/webhook/lit-proposal-preparation`
- **Event Type:** `proposal.draft_requested`
- **Workflow File:** `LIT-07-proposal-preparation.json`
- **Trigger:** Post-consultation discovery notes submitted by Lead Engineer.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Map service packages & pricing` (From ₹8,999 to Enterprise tier)
  4. `Synthesize proposal milestones & timeline` (M1 kickoff to M4 delivery)
  5. `Generate proposal PDF contract metadata`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-08: Sales Pipeline Follow-Up
- **Canonical Name:** `LIT — Sales Pipeline Follow-Up`
- **Webhook Path:** `/webhook/lit-sales-pipeline-followup`
- **Event Type:** `pipeline.followup_triggered`
- **Workflow File:** `LIT-08-sales-pipeline-followup.json`
- **Trigger:** Cron runner evaluating stagnant proposals (>48 hours without reply).
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Suppression & consent check` (Strict opt-out enforcement)
  4. `Follow-up cadence calculator` (Touchpoint sequence 1 to 3 max)
  5. `Draft polite follow-up message`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

---

## Tier 2 — Service-Specific Project Delivery (LIT-09 to LIT-15)

### LIT-09: Project Requirement Intake
- **Canonical Name:** `LIT — Project Requirement Intake`
- **Webhook Path:** `/webhook/lit-project-requirement-intake`
- **Event Type:** `project.requirement_intake`
- **Workflow File:** `LIT-09-project-requirement-intake.json`
- **Trigger:** Signed contract or client intake questionnaire submission.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Validate intake schema` (Enforces Web, App, Game, AI, SaaS, Enterprise schemas)
  4. `Synthesize milestones & architecture` (Generates M1–M4 milestones, tech stack roadmap)
  5. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-10: Project Workspace Creation
- **Canonical Name:** `LIT — Project Workspace Creation`
- **Webhook Path:** `/webhook/lit-project-workspace-creation`
- **Event Type:** `project.workspace_created`
- **Workflow File:** `LIT-10-project-workspace-creation.json`
- **Trigger:** Approved project intake.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Provision GitHub repository & branch structure`
  4. `Configure project workspace settings`
  5. `Dispatch workspace credentials notice`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-11: Development Milestone Tracking
- **Canonical Name:** `LIT — Development Milestone Tracking`
- **Webhook Path:** `/webhook/lit-development-milestone-tracking`
- **Event Type:** `project.milestone_updated`
- **Workflow File:** `LIT-11-development-milestone-tracking.json`
- **Trigger:** GitHub PR merge to staging or manual milestone completion in Admin portal.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Recalculate milestone progress & completion percentage`
  4. `Verify acceptance criteria met`
  5. `Update client dashboard timeline`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-12: Automated Quality Reporting
- **Canonical Name:** `LIT — Automated Quality Reporting`
- **Webhook Path:** `/webhook/lit-automated-quality-reporting`
- **Event Type:** `project.qa_completed`
- **Workflow File:** `LIT-12-automated-quality-reporting.json`
- **Trigger:** CI/CD pipeline completion (unit tests, Playwright E2E, ESLint, TypeScript).
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Aggregate test pass rates & coverage metrics`
  4. `Evaluate security & vulnerability scans`
  5. `Format QA executive card`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-13: Client Progress Reports
- **Canonical Name:** `LIT — Client Progress Reports`
- **Webhook Path:** `/webhook/lit-client-progress-reports`
- **Event Type:** `client.progress_report_dispatched`
- **Workflow File:** `LIT-13-client-progress-reports.json`
- **Trigger:** Weekly cron runner (Mondays 09:00 IST).
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Fetch active sprint achievements & upcoming deliveries`
  4. `Synthesize transparent client summary`
  5. `Dispatch branded client update email`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-14: Delivery & Handover
- **Canonical Name:** `LIT — Delivery & Handover`
- **Webhook Path:** `/webhook/lit-delivery-handover`
- **Event Type:** `project.delivered`
- **Workflow File:** `LIT-14-delivery-handover.json`
- **Trigger:** Final milestone sign-off by client.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Verify production release verification checklist`
  4. `Package documentation & license keys`
  5. `Initiate 30-day warranty & support window`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-15: Maintenance & Renewal
- **Canonical Name:** `LIT — Maintenance & Renewal`
- **Webhook Path:** `/webhook/lit-maintenance-renewal`
- **Event Type:** `project.maintenance_renewal`
- **Workflow File:** `LIT-15-maintenance-renewal.json`
- **Trigger:** Cron runner (15 days prior to SLA or hosting expiration).
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Check SLA contract expiration & resource utilization`
  4. `Draft maintenance renewal proposal`
  5. `Dispatch renewal notification`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

---

## Tier 3 — Client Relationship Automation (LIT-17 to LIT-20)

### LIT-17: Support Ticket Routing
- **Canonical Name:** `LIT — Support Ticket Routing`
- **Webhook Path:** `/webhook/lit-support-ticket-routing`
- **Event Type:** `support.ticket_routed`
- **Workflow File:** `LIT-17-support-ticket-routing.json`
- **Trigger:** Inbound support ticket from `/client/support` portal.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Normalize ticket & compute SLA targets` (P1: 60m, P2: 240m, P3: 720m, P4: 1440m)
  4. `Assign engineering on-call owner`
  5. `Dispatch emergency escalation notice`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-18: Client Feedback & CSAT
- **Canonical Name:** `LIT — Client Feedback & CSAT`
- **Webhook Path:** `/webhook/lit-client-feedback-csat`
- **Event Type:** `client.feedback_requested`
- **Workflow File:** `LIT-18-client-feedback-csat.json`
- **Trigger:** 7 days post-handover or ticket closure.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Generate CSAT & NPS survey invitation`
  4. `Analyze response sentiment`
  5. `Trigger testimonial invite if CSAT >= 9`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-19: Quarterly Business Review (QBR)
- **Canonical Name:** `LIT — Quarterly Business Review`
- **Webhook Path:** `/webhook/lit-quarterly-business-review`
- **Event Type:** `client.qbr_scheduled`
- **Workflow File:** `LIT-19-quarterly-business-review.json`
- **Trigger:** 90-day recurring cron for Enterprise SLA accounts.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Aggregate uptime, SLA compliance rate, and engineering ROI`
  4. `Synthesize executive briefing deck agenda`
  5. `Schedule executive QBR consultation invite`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-20: Account Retention & Churn Sentinel
- **Canonical Name:** `LIT — Account Retention Sentinel`
- **Webhook Path:** `/webhook/lit-account-retention-sentinel`
- **Event Type:** `client.churn_risk_flagged`
- **Workflow File:** `LIT-20-account-retention-sentinel.json`
- **Trigger:** Telemetry detecting drop in client portal usage or unpaid invoice.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Calculate multi-factor churn risk score`
  4. `Dispatch VIP intervention alert to Vikash Saravanan`
  5. `Initiate proactive retention playbook`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

---

## Tier 4 — Financial & Commercial Operations (LIT-22 to LIT-24)

### LIT-22: Milestone Invoice Generation
- **Canonical Name:** `LIT — Milestone Invoice Generation`
- **Webhook Path:** `/webhook/lit-milestone-invoice-generation`
- **Event Type:** `billing.milestone_invoice_created`
- **Workflow File:** `LIT-22-milestone-invoice-generation.json`
- **Trigger:** Milestone sign-off in Admin portal.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Generate Razorpay / Stripe invoice in INR/USD`
  4. `Apply GST tax compliance rules`
  5. `Dispatch invoice notification to client finance`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-23: Payment Reconciliation
- **Canonical Name:** `LIT — Payment Reconciliation`
- **Webhook Path:** `/webhook/lit-payment-reconciliation`
- **Event Type:** `billing.payment_received`
- **Workflow File:** `LIT-23-payment-reconciliation.json`
- **Trigger:** Razorpay / Stripe payment webhook.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Reconcile payment transaction ID against Supabase invoice`
  4. `Unlock subsequent development milestone`
  5. `Issue automated tax invoice receipt`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-24: Overdue Payment Escalation
- **Canonical Name:** `LIT — Overdue Payment Escalation`
- **Webhook Path:** `/webhook/lit-overdue-payment-escalation`
- **Event Type:** `billing.payment_overdue`
- **Workflow File:** `LIT-24-overdue-payment-escalation.json`
- **Trigger:** Daily cron evaluating unpaid invoices past due date.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Evaluate days overdue (Day 3 polite, Day 7 urgent, Day 14 pause)`
  4. `Dispatch calibrated escalation notification`
  5. `Update project commercial status`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

---

## Tier 5 — Internal Operations & Knowledge Base (LIT-25 to LIT-27)

### LIT-25: Company Knowledge Base Synchronization
- **Canonical Name:** `LIT — Knowledge Base Sync`
- **Webhook Path:** `/webhook/lit-knowledge-sync`
- **Event Type:** `ops.knowledge_synced`
- **Workflow File:** `LIT-25-knowledge-sync.json`
- **Trigger:** Git commit modifying `docs/` or `src/lib/ai/company-knowledge.ts`.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Parse markdown documentation diff & chunk paragraphs`
  4. `Compute SHA-256 chunk checksums & 1536-dim embedding vector schema`
  5. `Upsert into Supabase rag_documents and flush cache`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-26: Internal Engineering Workstation Provisioning
- **Canonical Name:** `LIT — Engineering Onboarding`
- **Webhook Path:** `/webhook/lit-engineering-onboarding`
- **Event Type:** `ops.engineer_onboarded`
- **Workflow File:** `LIT-26-engineering-onboarding.json`
- **Trigger:** New staff role assigned in Supabase.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Assemble workstation RBAC checklist (GitHub, Supabase, Vercel)`
  4. `Mandate security orientation (GPG signing, 2FA, zero-trust PHI policy)`
  5. `Schedule Day 1 engineering walkthrough`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### LIT-27: Weekly System Health & Revenue Digest
- **Canonical Name:** `LIT — Weekly Operations Digest`
- **Webhook Path:** `/webhook/lit-weekly-operations-digest`
- **Event Type:** `ops.weekly_digest_generated`
- **Workflow File:** `LIT-27-weekly-operations-digest.json`
- **Trigger:** Cron runner (Sundays 20:00 IST).
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Roll up commercial pipeline, engineering deliveries, collections`
  4. `Synthesize executive briefing markdown`
  5. `Dispatch weekly digest to Founder Vikash Saravanan`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

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
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `PHI boundary check & inquiry validator` (Strict rejection of clinical terms)
  4. `Route to healthcare demo queue` (Calculates bed capacity priority P1–P3)
  5. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### HLT-02: Hospital Facility Onboarding
- **Canonical Name:** `HLT — Hospital Facility Onboarding`
- **Webhook Path:** `/webhook/hlt-facility-onboarding`
- **Event Type:** `healthcare.facility_onboarded`
- **Workflow File:** `HLT-02-facility-onboarding.json`
- **Trigger:** Hospital contract execution.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Enforce non-PHI tenant configuration`
  4. `Provision multi-tenant facility schema with RLS`
  5. `Dispatch operational hardware integration spec`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### HLT-03: ABDM / ABHA Gateway Heartbeat Monitor
- **Canonical Name:** `HLT — ABDM Gateway Monitor`
- **Webhook Path:** `/webhook/hlt-abdm-gateway-monitor`
- **Event Type:** `healthcare.abdm_heartbeat`
- **Workflow File:** `HLT-03-abdm-gateway-monitor.json`
- **Trigger:** 15-minute cron runner.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Probe ABHA / ABDM gateway endpoint latency & health`
  4. `Evaluate SLA thresholds (<1500ms)`
  5. `Escalate gateway degradation alert`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### HLT-04: Emergency OPD / IPD Capacity Alert
- **Canonical Name:** `HLT — Bed Capacity Alert`
- **Webhook Path:** `/webhook/hlt-bed-capacity-alert`
- **Event Type:** `healthcare.capacity_alert`
- **Workflow File:** `HLT-04-bed-capacity-alert.json`
- **Trigger:** Hospital occupancy exceeds 90% (Dispatched by hospital backend).
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Sanitized non-PHI capacity telemetry validator`
  4. `Check threshold >= 90% utilization`
  5. `Dispatch administrative capacity diversion alert`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### HLT-05: Pharmacy Low-Stock Reorder Automation
- **Canonical Name:** `HLT — Pharmacy Reorder Automation`
- **Webhook Path:** `/webhook/hlt-pharmacy-reorder`
- **Event Type:** `healthcare.pharmacy_low_stock`
- **Workflow File:** `HLT-05-pharmacy-reorder.json`
- **Trigger:** Drug inventory below reorder threshold.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Validate non-PHI inventory telemetry (SKU, currentStock, reorderThreshold)`
  4. `Generate supplier replenishment purchase order`
  5. `Dispatch purchase order for pharmacist review`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### HLT-06: Clinical Data Retention & Compliance Audit
- **Canonical Name:** `HLT — Compliance Audit Sentinel`
- **Webhook Path:** `/webhook/hlt-compliance-audit`
- **Event Type:** `healthcare.compliance_audit`
- **Workflow File:** `HLT-06-compliance-audit.json`
- **Trigger:** Monthly cron runner.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Audit database RLS enforcement & non-PHI compliance logs`
  4. `Evaluate security access anomalies`
  5. `Generate HIPAA / DPDP Act compliance certificate`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

---

## Tier 7 — Engineering & Operations SRE (OPS-01 to OPS-04)

### OPS-01: Deployment Failure Alert
- **Canonical Name:** `OPS — Deployment Failure Alert`
- **Webhook Path:** `/webhook/ops-deployment-failure-alert`
- **Event Type:** `ops.deployment_failed`
- **Workflow File:** `OPS-01-deployment-failure-alert.json`
- **Trigger:** GitHub Actions CI/CD failure or Vercel deployment error webhook.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Parse deployment failure & score severity` (P0_CRITICAL for production, P2 for staging)
  4. `Format incident alert card` (Summarizes commit, author, failed step, remedy)
  5. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### OPS-02: SSL Certificate & Domain Expiry Sentinel
- **Canonical Name:** `OPS — SSL & Domain Sentinel`
- **Webhook Path:** `/webhook/ops-ssl-domain-sentinel`
- **Event Type:** `ops.ssl_expiry_check`
- **Workflow File:** `OPS-02-ssl-domain-sentinel.json`
- **Trigger:** Daily cron runner at 00:00 UTC.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Probe corporate and client domains for SSL validity`
  4. `Flag certificates expiring in <14 days`
  5. `Dispatch certificate renewal escalation alert`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### OPS-03: Database Backup & Integrity Verification
- **Canonical Name:** `OPS — Database Integrity Verification`
- **Webhook Path:** `/webhook/ops-database-integrity`
- **Event Type:** `ops.database_integrity_checked`
- **Workflow File:** `OPS-03-database-integrity.json`
- **Trigger:** Daily cron runner at 03:00 UTC.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Verify Supabase database snapshot & checksum integrity`
  4. `Simulate point-in-time recovery health check`
  5. `Record integrity audit log`
  6. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`

### OPS-04: Automation Reliability Monitor
- **Canonical Name:** `OPS — Automation Reliability Monitor`
- **Webhook Path:** `/webhook/ops-automation-reliability-monitor`
- **Event Type:** `ops.reliability_monitor`
- **Workflow File:** `OPS-04-automation-reliability-monitor.json`
- **Trigger:** 5-minute cron runner or dead-letter threshold trigger.
- **Key Nodes:**
  1. `Webhook` (POST)
  2. `Verify signature` (HMAC-SHA256)
  3. `Analyze queue health & dead-letters` (Evaluates deadLetterCount, latency, pending retries)
  4. `Generate reliability report` (HEALTHY, DEGRADED, or CRITICAL state)
  5. `Sign callback` & `Callback`
- **Status:** `IMPLEMENTED & VERIFIED WORKING`
