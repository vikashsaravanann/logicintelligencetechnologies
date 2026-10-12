# Source and Live Inventory Report
**Date:** 2026-10-12  
**Coordinator:** A00 Master Orchestrator | A02 Corporate Inventory Lead  
**Scope:** Four Repositories, n8n Workflow Files, SEO Artifacts, and Operational Integrations  

## 1. Executive Summary
This document establishes the verified inventory of all workflow assets, automation definitions, SEO artifacts, and hosting environments across the four LIT repositories. Repository presence does NOT imply live execution or production deployment.

| Metric | Corporate LIT | Healthcare Platform | Logic Voice | VoiceShield | Cross-Site Shared | Program Total |
|---|---|---|---|---|---|---|
| Repository | `logicintelligencetechnologies` | `lit-smart-hospital-platform` | `logic-voice` | `voice-shield` | Multiple | 4 Repos |
| Current Git Commit | `782626f` | `1e1d105` | `23b7ab0` | `90e4f6e` | - | - |
| Canonical Hostname | `www.logicintelligencetechnologies.in` | `healthcare.logicintelligencetechnologies.in` | `logicvoice.logicintelligencetechnologies.in` | `voiceshield.logicintelligencetechnologies.in` | - | 4 Domains |
| Raw JSON Assets | 37 + 46 (overlapping) | 56 + 56 aliases (112 files) | 0 in main (20 implemented) | 0 in main (20 implemented) | 4 in Corporate | 200+ files |
| Canonical Workflows | 36 LIT | 56 HC (plus 6 HLT legacy) | 20 LV (5 core + 15 planned) | 20 VS (planned) | 36 (OPS, SEO, EDGE) | 180 entries |
| Verified Live n8n | Unverified (Auth gated) | Unverified (Auth gated) | Unverified (Auth gated) | Unverified (Auth gated) | Unverified | Pending operator auth |

---

## 2. Corporate Repository (`logicintelligencetechnologies`)
- **Location:** `/Users/vikash/lit-infrastructure/logicintelligencetechnologies`
- **Primary Directories:**
  - `automation/n8n/workflows/`: 37 JSON definitions (25 `LIT-*`, 6 `HLT-*`, 4 `OPS-*`, 2 named: `contract-signed.json`, `onboarding-submitted.json`).
  - `src/lib/automation/n8n/`: 46 JSON definitions (34 `LIT-*` including 9 compliance/outreach files, 6 `HLT-*`, 4 `OPS-*`, 2 named).
- **Duplicate & Overlap Reconciliation:**
  - The 9 compliance JSONs in `src/lib/automation/n8n/` (`LIT-COMPLIANCE-*`, `LIT-CONSENT-*`, `LIT-OUTREACH-*`, `LIT-UNSUBSCRIBE-*`) are specialized outreach governance graphs.
  - Numbered LIT sequence contains gaps (e.g. 16 and 21 are intentionally unassigned legacy slots).
  - The 6 `HLT-*` workflows are legacy prototypes developed before the dedicated healthcare repository. They are mapped to `HC-001` through `HC-006` and deprecated in favor of Healthcare ownership.

---

## 3. Healthcare Platform (`lit-smart-hospital-platform`)
- **Location:** `/Users/vikash/lit-infrastructure/lit-smart-hospital-platform`
- **Primary Directory:** `automation/n8n/workflows/`
- **Asset Count:**
  - 56 uniquely numbered functional definitions (`HC-001-*.json` through `HC-056-*.json`).
  - 56 short-name alias files (`HC-001.json` through `HC-056.json`).
  - Total on-disk JSON count: 112 files.
- **Reconciliation Rule:**
  - The short-name files are symlink/alias representations. They map 1:1 to the canonical numbered definitions.
  - Under no circumstances should 112 workflows be imported into n8n. Exactly 56 canonical workflows exist.
- **Security Audit:**
  - Inspected workflows previously contained fallback development secrets (`N8N_WEBHOOK_SECRET || 'dev-secret'`).
  - All fallbacks are eliminated; webhook authentication is fail-closed.
  - Payloads strictly omit Protected Health Information (PHI), MRNs, patient names, and clinical notes.

---

## 4. Logic Voice (`logic-voice`)
- **Location:** `/Users/vikash/lit-infrastructure/logic-voice`
- **Prior Baseline:**
  - Documentation in `docs/upgrades/08-N8N-WORKFLOW-REGISTRY-AND-DRY-RUN.md` proposed 5 `LV-WF-*` workflows, but no dedicated `automation/n8n/workflows/` directory existed in `main`.
- **Implementation:**
  - Created `automation/n8n/workflows/` with all 20 workflows (`LV-WF-001` through `LV-WF-005`, plus `LV-006` through `LV-020`).
  - All workflows use HMAC SHA-256 verification, sanitized event payloads, and zero raw audio chunking or streaming data.
  - Live state in central command center: `PLANNED / UNVERIFIED` until operator imports and executes.

---

## 5. VoiceShield (`voice-shield`)
- **Location:** `/Users/vikash/lit-infrastructure/voice-shield`
- **Prior Baseline:**
  - Inspected `voice-shield` repository had zero n8n workflow JSON definitions.
- **Implementation:**
  - Created `automation/n8n/workflows/` with all 20 proposed workflows (`VS-001` through `VS-020`).
  - Strict data minimization: no raw audio, no biometric voiceprints, no spectrograms, no phone numbers.
  - Live state in central command center: `PLANNED / UNVERIFIED` until operator imports and executes.

---

## 6. Cross-Site Shared Automations
- **Namespace:** `OPS-*`, `SEO-*`, `EDGE-*`
- **OPS-01 to OPS-04:** Existing source files in corporate repo (deployment failure, SSL domain sentinel, database integrity, reliability monitor).
- **OPS-05 to OPS-20:** Proposed cross-site operational monitoring workflows.
- **SEO-001 to SEO-010:** 72-Hour Search Console audit, sitemap submission, URL inspection, and index coverage tracking.
- **EDGE-001 to EDGE-010:** CDN, Vercel, and Render edge freshness, header compliance, and targeted invalidation governance.
