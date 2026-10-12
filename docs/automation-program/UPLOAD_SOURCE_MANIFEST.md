# Uploaded Source Assets Manifest & Provenance Audit

**Program:** Logic Intelligence Technologies (LIT) Four-Website Unified Automation Command Center  
**Document ID:** `LIT-OPS-MANIFEST-001`  
**Classification:** Asset Provenance, Integrity & Intellectual Property Classification  
**Owner:** Worker 4 (Technical SEO, Infrastructure & Multi-Site Specialist / A24, A25)  
**Last Revised:** 2026-10-12  
**Status:** CANONICAL AUDIT COMPLETE  

---

## 1. Executive Summary

In October 2026, an external reference asset bundle containing 7 files was supplied to the engineering program. These assets contain an example n8n automation graph, setup documentation, data schema templates, and master prompt specifications for lead qualification and calendar booking.

This document establishes the verified inventory, cryptographic SHA-256 fingerprints, structural analysis, classification, and strict legal/operational ownership limitations of all 7 files. Under program governance rule **08A.1**, third-party vendor assets are retained strictly as **read-only reference fixtures** and are prohibited from being imported directly into the LIT production automation catalog.

---

## 2. Cryptographic Fingerprints & Asset Inventory

The table below lists each of the 7 received files, its verified filesystem location, byte size, SHA-256 cryptographic digest, and operational status:

| # | Asset Filename | Current File Location | Size (Bytes) | SHA-256 Checksum | Operational Classification |
|---|---|---|---|---|---|
| **1** | `LIT_FOUR_WEBSITE_UNIFIED_AUTOMATION_COMMAND_CENTER_GSC_CDN_72H_MASTER_PROMPT.md` | `/Users/vikash/lit-infrastructure/` | 85,836 | `73aee274a0237061cb5fb90ced424f3e05cc147d4df3bd50b31075d98f328893` | Baseline Master Specification (778 lines, 26 roles, 25 admin routes, QA-01..56) |
| **2** | `LIT_FOUR_SITE_AUTOMATION_IMPLEMENTATION_REGISTRY.csv` | `/Users/vikash/lit-infrastructure/` | 39,571 | `f491dc2e8ee3872939873abab9b472d77a35969af84e0dc0e72b535d4672dc1c` | Master Scope Registry (178 distinct rows, 10 columns, all `UNVERIFIED`) |
| **3** | `cleaning-enquiry-workflow.json` | `/Users/vikash/Downloads/` | 31,916 | `ae06aa09fc900305afe0f77b03f6902491b27ad3803c60c3490553827b7e2efd` | Third-Party Reference Graph (27 nodes, 23 connection sources, `active:false`) |
| **4** | `Cleaning-Workflow-Guide.pdf` | `/Users/vikash/Downloads/` | 6,783 | `4fae9d1343a2804bbacb9111277302d6fb02df627239b14cca6d1c31ec630ef7` | Third-Party Setup & Flow Guide (3 pages, PEKIFLOW documentation) |
| **5** | `START-HERE.txt` | `/Users/vikash/Downloads/` | 411 | `b6e5c4e02d8e28a524a9e980f785731d0bcd54127379d492a422585fc5e002e3` | Operational Setup Instructions (Setup order, placeholders, disclaimer) |
| **6** | `Messages.csv` | `/Users/vikash/Downloads/` | 40 | `9a1bf7c8bc7acd66a170d225fd9ff389d1de1fa3b0012c46b31766674481c122` | Header-Only Schema Template (`message_id,thread_id,status,updated_at`, 0 rows) |
| **7** | `Threads.csv` | `/Users/vikash/Downloads/` | 110 | `5319f8ccd0ddbce51d7d08a096679ce714e3d9b60ce4317d0cb8b80d28689357` | Header-Only Schema Template (9 columns, 0 rows) |

---

## 3. Detailed Forensic Analysis of Each Asset

### Asset 1: LIT Four-Website Unified Automation Command Center Master Prompt
- **Format:** Markdown document (`LIT_FOUR_WEBSITE_UNIFIED_AUTOMATION_COMMAND_CENTER_GSC_CDN_72H_MASTER_PROMPT.md`)
- **Observed Structure:** 778 lines specifying the four controlled properties (Corporate, Healthcare, Logic Voice, VoiceShield), the 26 engineering specialist roles (A00–A25), 25 admin destinations, and the original 56 QA scenarios (QA-01 through QA-56).
- **Program Interpretation:** Authoritative foundational blueprint for multi-site control plane architecture, risk classification (R0–R4), fail-closed HMAC webhook security, and 72-hour SEO/CDN governance.

### Asset 2: LIT Four-Site Automation Implementation Registry
- **Format:** Comma-Separated Values (`LIT_FOUR_SITE_AUTOMATION_IMPLEMENTATION_REGISTRY.csv`)
- **Observed Structure:** 178 unique data rows across 10 metadata columns:
  - Corporate LIT: 36 workflows (numbered LIT-01..25, named, compliance/outreach)
  - Healthcare Platform: 56 workflows (`HC-001` through `HC-056`)
  - Healthcare Shared / Legacy: 6 workflows (`HLT-001` through `HLT-006`)
  - Logic Voice: 20 workflows (5 documented, 15 proposed)
  - VoiceShield: 20 workflows (20 proposed threat/incident workflows)
  - Cross-Site Operations: 40 workflows (4 OPS source templates + 36 scheduled edge/SEO capabilities)
- **Status Truthfulness:** All 178 entries are explicitly classified as `live_status = UNVERIFIED`. This registry reflects planned scope, not live execution evidence.

### Asset 3: PEKIFLOW Cleaning Enquiry Workflow
- **Format:** n8n Workflow JSON (`cleaning-enquiry-workflow.json`)
- **Workflow Name:** `Cleaning Enquiries - Gemini and Cal.com`
- **Active Flag:** `active: false` (deactivated by default)
- **Graph Topology:** 27 nodes connected through 23 connection source mappings.
- **Triggers & Filters:** Gmail Trigger polling on 1-minute intervals restricted strictly to query `in:inbox subject:TEST-DAY5`.
- **Integrations Referenced:** Gmail, Google Sheets (lookup/append), Google Gemini 2.5 Flash Lite LLM (`@n8n/n8n-nodes-langchain.lmChatGoogleGemini`), Structured Lead Output Parser, and Cal.com URL interpolation.
- **Critical Finding:** Contains hardcoded cleaning consultation text ("30-minute cleaning consultation"), placeholder credentials (`REPLACE_OWNER_EMAIL`, `REPLACE_CAL_COM_BOOKING_URL`), and uncommitted Sheets-only state management.

### Asset 4: Cleaning Workflow Setup Guide
- **Format:** Adobe Portable Document Format (`Cleaning-Workflow-Guide.pdf`)
- **Contents:** 3-page guide explaining workflow architecture, credential setup in n8n, Google Sheets tab creation, and Cal.com link generation.
- **Critical Caveat:** Page 3 explicitly documents that Cal.com bookings are external and are **not** synchronized back into Google Sheets. The guide notes that recipient-configured end-to-end execution must be tested before live use.

### Asset 5: Setup Sequence Instructions
- **Format:** Plain Text (`START-HERE.txt`)
- **Contents:** 411 bytes directing operators to start with `Cleaning-Workflow-Guide.pdf`, import the JSON into n8n, configure credentials, replace placeholder settings, create Sheets tabs from CSVs, and conduct initial testing using `TEST-DAY5` subject lines.
- **Disclaimer:** Affirms that no live API keys, accounts, or recipient settings are provided.

### Asset 6: Messages Data Schema Template
- **Format:** Comma-Separated Values (`Messages.csv`)
- **Byte Size:** 40 bytes
- **Header:** `message_id,thread_id,status,updated_at`
- **Record Count:** Exactly 0 data records.
- **Finding (QA-59):** Confirmed empty header template. Must not be counted or reported as processed customer communications or transactional ledger entries.

### Asset 7: Threads Data Schema Template
- **Format:** Comma-Separated Values (`Threads.csv`)
- **Byte Size:** 110 bytes
- **Header:** `thread_id,customer_email,customer_name,service,status,offered_start,offered_end,calendar_event_id,reply_text`
- **Record Count:** Exactly 0 data records.
- **Finding (QA-59):** Confirmed empty header template. Must not be reported as customer bookings, leads, or calendar events.

---

## 4. Ownership, Licensing & Intellectual Property Boundaries

1. **No Fifth Business Unit:**  
   LIT is an enterprise AI software and infrastructure engineering firm specializing in intelligent platforms, clinical operating systems, and voice security. LIT is **not** a cleaning business. The cleaning workflow is a third-party architectural sample.
2. **Third-Party Provenance & Attribution:**  
   The PEKIFLOW cleaning workflow assets (JSON, PDF, CSVs, TXT) are external vendor artifacts. They are retained solely in local staging/reference fixtures. They are never published as native LIT proprietary intellectual property.
3. **Privacy & Data Protection:**  
   None of the received files contain genuine customer personal data, phone numbers, email addresses, or API secrets. Under no circumstances may real customer enquiry bodies or patient PHI be exported into external templates.
4. **Pattern Adaptation Boundary:**  
   Only the abstract *pattern*—inbound email normalization, idempotent database claims, AI-assisted lead extraction, human approval gates, and verified calendar scheduling—is adapted into the LIT corporate control plane. The cleaning-specific template is quarantined outside the production n8n instance.
