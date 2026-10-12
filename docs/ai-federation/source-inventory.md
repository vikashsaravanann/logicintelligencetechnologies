# LIT Four-Site Public Knowledge Source Inventory

**Specification Date:** 12 October 2026  
**Scope:** Corporate LIT, LIT Healthcare, Logic Voice, VoiceShield  
**Index Status:** 107 Total Discovered Routes | 82 Eligible Public Indexable | 25 Protected & Scoped  

---

## 1. Summary of Discovered Routes by Repository

| Property | Repository | Total Discovered | Public Indexable | Auth / Admin Gated | Clinical / Private | Ingestion Policy |
|---|---|---|---|---|---|---|
| **Corporate LIT** | `logicintelligencetechnologies` | 34 | 31 | 3 | 0 | `ALLOW_INDEX` (public) / `QUARANTINE_NOINDEX` (admin) |
| **LIT Healthcare** | `lit-smart-hospital-platform` | 16 | 13 | 1 | 2 | `ALLOW_INDEX` (public) / `EXCLUDE_STRICT` (portal) |
| **Logic Voice** | `logic-voice` | 24 | 21 | 3 | 0 | `ALLOW_INDEX` (public) / `USER_ISOLATION` (workspace) |
| **VoiceShield** | `voice-shield` | 33 | 31 | 1 | 1 | `ALLOW_INDEX` (public) / `EXCLUDE_STRICT` (SOC) |
| **Total** | *Four Repositories* | **107** | **82** | **8** | **3** | *Audited and Verified* |

---

## 2. Ingestion Namespaces & Routing

### 2.1 `lit.corporate.public`
- **Canonical URL:** `https://www.logicintelligencetechnologies.in`
- **Content:** Verified company facts, leadership bios, contact channels, product suite overview, commercial plans, engineering services, AI ethics, terms, privacy.
- **Refresh Strategy:** `ON_DEPLOY_WEBHOOK` + 72-hour reconciliation scan.
- **Allowed Consumers:** Corporate LOGIC AI, Logic Voice Federated Search.

### 2.2 `lit.healthcare.public`
- **Canonical URL:** `https://healthcare.logicintelligencetechnologies.in`
- **Content:** Platform overview, hospital/clinic licensing tiers, clinical modules, multi-facility operations, data protection safeguards, disclaimers.
- **Strict Boundary:** No patient records or clinical transactions in this namespace.
- **Allowed Consumers:** Healthcare Logic Care Companion, Logic Voice Federated Search.

### 2.3 `lit.logicvoice.public`
- **Canonical URL:** `https://logicvoice.logicintelligencetechnologies.in`
- **Content:** Personal voice workspace overview, ToolBus architecture, speech pipeline, memory controls, skills directory, pricing, developer docs.
- **Allowed Consumers:** Logic Voice, VoiceShield, Corporate LOGIC AI.

### 2.4 `lit.voiceshield.public`
- **Canonical URL:** `https://voiceshield.logicintelligencetechnologies.in`
- **Content:** Synthetic speech threat intelligence, AASIST detection architecture, telephony integration guides, compliance (DPDP Act 2023), AI limitations.
- **Allowed Consumers:** VoiceShield Assistant, Logic Voice Federated Search.

---

## 3. Protected Personal & Clinical Connectors (Permission-Gated)

1. **`lit.healthcare.patient.secure`**:
   - Authorized patient session with verified hospital membership.
   - Accesses only patient's own released reports, scheduled appointments, and verified prescriptions.
   - **Never shared across users or indexed globally.**

2. **`lit.voiceshield.soc.secure`**:
   - Authenticated SOC operator session with MFA.
   - Accesses owned case logs, incident metrics, and telephony streams.
   - **Never exposed to public queries.**

3. **`lit.logicvoice.personal`**:
   - Authenticated user workspace.
   - Accesses user's private notes, reminders, contacts, and connected OAuth accounts.
   - **Strictly isolated by `user_id` and `domain`.**
