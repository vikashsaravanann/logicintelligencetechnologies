# Source Alias and Duplicate Reconciliation Map
**Program:** LIT Four-Site Unified Automation Command Center  
**Coordinator:** A00 Master Orchestrator | A01 Architecture Lead  

## 1. Overview
Multiple repositories historically contained duplicate definitions, filename aliases, and overlapping domain boundaries. This document defines the canonical source-of-truth mapping to prevent double-counting, split-brain configurations, or duplicate execution in n8n.

---

## 2. Corporate LIT Duplicate Reconciliation

### 2.1 Overlapping Directories
- **Directory A:** `automation/n8n/workflows/` (37 files)
- **Directory B:** `src/lib/automation/n8n/` (46 files)

| Logical Key | Canonical Path | Deprecated / Secondary Copy | Reconciliation Action |
|---|---|---|---|
| `LIT-01` to `LIT-15` | `automation/n8n/workflows/LIT-##-*.json` | `src/lib/automation/n8n/LIT-##.json` | Use `automation/n8n/workflows/` as canonical source |
| `LIT-17` to `LIT-20` | `automation/n8n/workflows/LIT-##-*.json` | `src/lib/automation/n8n/LIT-##.json` | Use `automation/n8n/workflows/` as canonical source |
| `LIT-22` to `LIT-27` | `automation/n8n/workflows/LIT-##-*.json` | `src/lib/automation/n8n/LIT-##.json` | Use `automation/n8n/workflows/` as canonical source |
| `LIT-COMPLIANCE-*` (9 files) | `src/lib/automation/n8n/LIT-*.json` | None (exclusive to `src/lib/`) | Register under `CORPORATE` outreach governance |
| `contract-signed` | `automation/n8n/workflows/contract-signed.json` | `src/lib/automation/n8n/contract-signed.json` | Canonical in `automation/n8n/workflows/` |
| `onboarding-submitted` | `automation/n8n/workflows/onboarding-submitted.json` | `src/lib/automation/n8n/onboarding-submitted.json` | Canonical in `automation/n8n/workflows/` |
| `HLT-01` to `HLT-06` | `automation/n8n/workflows/HLT-##-*.json` | `src/lib/automation/n8n/HLT-##.json` | Marked DEPRECATED in Corporate; ceded to Healthcare repo |

---

## 3. Healthcare 112 Files: 56 Canonical vs 56 Aliases

In `lit-smart-hospital-platform/automation/n8n/workflows/`:
The files exist in pairs: `HC-###-<descriptive-name>.json` and `HC-###.json`.
**Resolution:** The descriptive names are canonical. The short-name files are build-time aliases. Exactly 56 workflows must be registered.

| Canonical Workflow Key | Full Descriptive File (Canonical) | Alias File (Do NOT Import Separately) |
|---|---|---|
| `HC-001` | `HC-001-public-demo-inquiry-intake.json` | `HC-001.json` |
| `HC-002` | `HC-002-explore-plans-attribution.json` | `HC-002.json` |
| `HC-003` | `HC-003-cart-incomplete-follow-up.json` | `HC-003.json` |
| `HC-004` | `HC-004-organization-setup-request.json` | `HC-004.json` |
| `HC-005` | `HC-005-organization-identity-verification-task.json` | `HC-005.json` |
| `HC-006` | `HC-006-organization-approval-decision-notice.json` | `HC-006.json` |
| `HC-007` to `HC-056` | `HC-###-<name>.json` | `HC-###.json` |

---

## 4. Corporate HLT vs Healthcare HC Domain Overlap

Before the creation of the dedicated Healthcare Platform, 6 workflows (`HLT-01` through `HLT-06`) were placed in the Corporate repository.

| Legacy Corporate Key | Legacy Name | Healthcare Canonical Key | Healthcare Canonical Workflow | Status & Recommendation |
|---|---|---|---|---|
| `HLT-01` | Healthcare Demo Inquiry | `HC-001` | Public Demo Inquiry Intake | **DEPRECATE HLT-01**: Use HC-001 in Healthcare |
| `HLT-02` | Facility Onboarding | `HC-004` / `HC-007` | Organization Setup / Provisioning | **DEPRECATE HLT-02**: Use HC-004 & HC-007 in Healthcare |
| `HLT-03` | ABDM Gateway Monitor | `HC-040` / `HC-042` | n8n / Supabase Health Monitors | **DEPRECATE HLT-03**: Hospital backend manages ABDM |
| `HLT-04` | Bed Capacity Alert | `HC-032` | Organization Usage Trend Digest | **DEPRECATE HLT-04**: Clinical bed capacity stays in hospital DB |
| `HLT-05` | Pharmacy Reorder | Internal Backend | Hospital Inventory Service | **DEPRECATE HLT-05**: Pharmacy orders stay in hospital DB |
| `HLT-06` | Compliance Audit | `HC-043` / `HC-044` | Audit Due Reminder / Data Retention | **DEPRECATE HLT-06**: Use HC-043/HC-044 in Healthcare |

---

## 5. Logic Voice & VoiceShield Workflow Identification

- **Logic Voice:**
  - 5 Documented Workflows: `LV-WF-001` to `LV-WF-005`
  - 15 Extended Workflows: `LV-006` to `LV-020`
  - Prefix standard: `LV-*`
- **VoiceShield:**
  - 20 Workflows: `VS-001` to `VS-020`
  - Prefix standard: `VS-*`
- **Cross-Site Shared Operations:**
  - `OPS-01` to `OPS-20`
  - `SEO-001` to `SEO-010`
  - `EDGE-001` to `EDGE-010`
