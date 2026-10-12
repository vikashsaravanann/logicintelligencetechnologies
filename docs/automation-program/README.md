# LIT Four-Website Unified Automation Command Center & 72-Hour Operations Program

## Overview
This directory contains the canonical specifications, registries, data schemas, security reviews, audit logs, and runbooks for the **Logic Intelligence Technologies (LIT)** Four-Website Unified Automation Command Center, 72-Hour Google Search Console & SEO Operations, and CDN/Edge Cache Governance.

## Controlled Properties
1. **Corporate LIT**: `https://www.logicintelligencetechnologies.in/` (Repo: `logicintelligencetechnologies`)
2. **Healthcare Platform**: `https://healthcare.logicintelligencetechnologies.in/` (Repo: `lit-smart-hospital-platform`)
3. **Logic Voice**: `https://logicvoice.logicintelligencetechnologies.in/` (Repo: `logic-voice`)
4. **VoiceShield**: `https://voiceshield.logicintelligencetechnologies.in/` (Repo: `voice-shield`)

## Key Architecture Principles
- **Corporate Control Plane**: Central executive and staff administration at `/admin/` in Corporate LIT.
- **Strict Data Plane Isolation**: Healthcare PHI stays in Healthcare; Voice recordings stay in Logic Voice; Biometric audio and fraud evidence stay in VoiceShield. Only sanitized pseudonymous operational metrics appear centrally.
- **Fail-Closed Security**: All webhook endpoints enforce HMAC SHA-256 signatures with constant-time verification, timestamp validation, and unique event ID deduplication. Fallback development secrets are banned.
- **No Blanket Activation**: Global `activate-all` scripts are strictly prohibited. Activation requires policy review, stage testing, and authorized sign-off.
- **Truthful Status**: No synthetic or hardcoded `Active` statuses. Disconnected services display `UNKNOWN / UNAVAILABLE`.
- **72-Hour Cadence**: Google Search Console inspection and sitemap verification runs every 72 hours with slot-locking idempotency. Google Indexing API is guarded against improper usage on standard content pages.
- **Targeted CDN Purge**: Universal scheduled CDN purges are prohibited. Invalidation is strictly targeted and evidence-driven.

## Documentation Index
- `LOCKS.md`: Agent assignment and file lock registry
- `CANONICAL_WORKFLOW_REGISTRY.csv`: Master registry of all 180 canonical automation items
- `REQUIREMENT_TRACEABILITY.csv`: 56 QA scenarios mapped to implementation and verification
- `SOURCE_AND_LIVE_INVENTORY.md`: Audit of source files vs live instances across 4 repositories
- `SOURCE_ALIAS_AND_DUPLICATE_MAP.md`: Resolution of duplicate and alias workflows (HLT vs HC, 56 HC aliases)
- `PROJECT_SITE_AND_PROVIDER_MAPPING.md`: Domains, hostnames, infrastructure providers, and CDN mappings
- `WORKFLOW_EVENT_SCHEMA.md`: Standard JSON schemas for outbox events, webhook payloads, and receipts
- `WORKFLOW_ACTIVATION_AND_APPROVAL_MATRIX.md`: Risk-tiered approval policies (R0 to R4)
- `WORKFLOW_RISK_AND_DATA_CLASSIFICATION.md`: Data classification and privacy rules
- `AUTOMATION_CREDENTIAL_AND_SIGNATURE_REVIEW.md`: HMAC, vault secret references, and rotation procedures
- `SEO_FOUR_SITE_PROPERTY_REGISTRY.md`: GSC property definitions, verification states, and quota allocations
- `SEO_SITEMAP_ROBOTS_AND_CANONICAL_AUDIT.md`: Audit of public canonicals, robots.txt exclusions, and lastmod freshness
- `SEO_72H_SCHEDULE_AND_TEST_REPORT.md`: 72-hour cycle execution logic, anchor timestamps, and test results
- `GSC_OAUTH_AND_QUOTA_RUNBOOK.md`: GSC API integration, token refresh, and quota safety
- `CDN_CACHE_FRESHNESS_AND_INVALIDATION_RUNBOOK.md`: Edge cache inspection, deploy SHA matching, and selective purge
- `DEPLOYMENT_AND_ROLLBACK.md`: Staging, release gates, Vercel CLI token rotation, and rollback runbooks
- `PRODUCTION_APPROVAL_REQUEST.md`: Formal human sign-off request before live production changes
- `FINAL_PRODUCTION_EVIDENCE_REPORT.md`: Comprehensive A-Z verification report with test evidence (QA-01 through QA-78)

### V2 Customer Enquiry & Four-Worker Deliverables
- `UPLOAD_SOURCE_MANIFEST.md`: SHA-256 fingerprinting, classification, and quarantine boundary of all 7 uploaded reference sources
- `ENQUIRY_WORKFLOW_REFERENCE_AUDIT.md`: Comprehensive node-by-node audit of 27 nodes, 23 connections, Issues A-N in reference workflow
- `ENQUIRY_WORKFLOW_STATE_MACHINE.md`: Production 8-stage state machine, composite unique constraint claim, two-phase dispatch, timeout reconciliation
- `ENQUIRY_APPROVAL_AND_BOOKING_INTEGRATION.md`: Human approval architecture, single-use HMAC tokens, Gemini 2.5 Flash Lite guardrails (temp 0.0), Cal.com webhook integration, zero-PHI policy
- `ENQUIRY_AND_BOOKING_TEST_REPORT.md`: Verification evidence for QA-57 through QA-78 (all 22 scenarios passing)
- `FOUR_WORKER_HANDOFF.md`: Mapping of 26 specialist roles across 4 workers, path locks, coordination tickets INQ-001..006, cross-repo PR rules
- `EXTERNAL_CONNECTION_OWNER_ACTIONS.md`: Masked credentials (`whsec_*****`), required provider permissions (GSC, Cal.com, Gmail, Vercel, n8n), operator setup runbooks

