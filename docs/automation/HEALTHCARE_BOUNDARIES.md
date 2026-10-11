# Healthcare Security Perimeter & Boundary Specification

**Platform:** Logic Intelligence Technologies (LIT)  
**Domains Covered:** Corporate Platform (`logicintelligencetechnologies`) & Healthcare Platform (`lit-smart-hospital-platform`)  
**Regulatory Standards:** HIPAA (Health Insurance Portability and Accountability Act - 45 CFR Parts 160/164) & DPDP Act 2023 (Digital Personal Data Protection Act - India)  
**Document Reference:** `LIT-SEC-HLT-002`  
**Version:** 1.0.0  
**Effective Date:** October 2026  
**Status:** Approved & Enforced  

---

## 1. Regulatory Perimeter & Architecture

Logic Intelligence Technologies operates two structurally separated software ecosystems:
1. **The Corporate Platform** (`logicintelligencetechnologies`): Marketing, enterprise client onboarding, commercial contract management, and general business automation.
2. **The Healthcare Platform** (`lit-smart-hospital-platform`): A multi-tenant Hospital Management Information System (HMIS) handling electronic health records (EHR), clinical encounters, diagnostic lab orders, pharmacy dispensing, inpatient bed tracking, and outpatient scheduling.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CORPORATE & HEALTHCARE BOUNDARY PERIMETER                  │
└─────────────────────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────┐         ┌─────────────────────────────────┐
   │     CORPORATE PLATFORM         │         │      HEALTHCARE PLATFORM        │
   │  (logicintelligencetechnologies)│         │  (lit-smart-hospital-platform)  │
   │                                │         │                                 │
   │  - Client CRM & Contracts      │         │  - Clinical Encounters & EHR    │
   │  - Onboarding Intake           │         │  - Diagnostic Lab Orders        │
   │  - Corporate Billing           │         │  - Pharmacy & Prescriptions     │
   │  - General n8n Workflows       │         │  - Inpatient & Outpatient Care  │
   └───────────────┬────────────────┘         └────────────────┬────────────────┘
                   │                                           │
                   ▼                                           ▼
      [ Corporate Supabase DB ]                    [ Healthcare Supabase DB ]
      - Forced RLS                                 - Forced RLS & Private Schemas
      - Service Role Key A                         - Service Role Key B (ISOLATED)
                   │                                           │
                   └───────────────────┬───────────────────────┘
                                       │
                      =================▼=================
                      AIR-GAPPED AUTOMATION INTERFACE
                      No Direct DB-to-DB Links
                      No Shared Service-Role Keys
                      Zero PHI in Payload or Queue
                      =================▲=================
                                       │
                        ┌──────────────┴──────────────┐
                        │    n8n AUTOMATION ENGINE    │
                        │    Opaque UUID Events Only  │
                        │    Strict Payload Sanitizer │
                        └─────────────────────────────┘
```

### 1.1 Compliance Frameworks

- **HIPAA Security & Privacy Rules (45 CFR § 164.308, § 164.312)**: Administrative, physical, and technical safeguards. Mandates role-based access, end-to-end encryption, strict audit logging, and the absolute prohibition of unencrypted or untracked Protected Health Information (PHI).
- **India Digital Personal Data Protection (DPDP) Act, 2023**: Establishes strict fiduciary obligations regarding the processing, consent management, storage limitation, and cross-border transfer of sensitive personal digital data.
- **Zero-Trust Multi-Tenancy Invariant**:
  $$\text{LIT} \longrightarrow \text{Customer Organization} \longrightarrow \text{Facility} \longrightarrow \text{Department} \longrightarrow \text{Staff/Clinicians} \longrightarrow \text{Patients}$$
  **Organization A must never access Organization B data under any operational circumstance.** Isolation is enforced at two distinct layers: application-level domain authorization (FastAPI / Next.js) and database-level Row-Level Security (PostgreSQL RLS).

---

## 2. The Non-Negotiable PHI Invariant

```
[ INVIOLABLE SECURITY DIRECTIVE ]
NO Protected Health Information (PHI), Sensitive Personal Data (SPD), clinical notes,
prescriptions, lab values, diagnostic summaries, or patient legal names may EVER enter:
1. General n8n webhook payloads.
2. n8n workflow execution memory or persistent state logs.
3. Third-party automation queues (Redis / Celery / BullMQ).
4. Error tracking or telemetry services (Sentry / Datadog / Logflare).
5. Audit logs, email subject lines, or SMS bodies.
```

### 2.1 Prohibited Data Classifications

The following data fields are strictly **BANNED** from all automation messages and webhook payloads:

| Category | Banned Data Elements | Permitted Alternative |
|---|---|---|
| **Patient Demographics** | Legal first/last name, national ID (Aadhaar, SSN), passport number, residential address, emergency contact name. | Anonymous `patientId` (UUIDv4) or opaque notification token. |
| **Clinical Diagnostics** | ICD-10/ICD-11 codes, diagnostic descriptions, symptoms, disease staging, clinical impressions, pathology results. | Generic event type: e.g., `event_type: "lab_order.ready"` with zero clinical content. |
| **Medication & Treatment** | Drug names, dosage, titration instructions, prescription images, pharmacy dispensing logs. | Status flag: e.g., `prescription_status: "ready_for_pickup"`. |
| **Clinical Notes & Records** | Doctor progress notes, nursing observations, surgical summaries, psychiatric evaluations. | Completely excluded. Never referenced in automation. |
| **Medical Imaging** | DICOM files, radiology reports, ultrasound/CT/MRI scans, biopsy images. | Completely excluded. Managed solely in HIPAA-compliant PACS/VNA. |

### 2.2 Data Minimization & Opaque Token Architecture

All automation payloads interacting with or triggered by the Healthcare Platform MUST conform to the **Opaque Token Pattern**:
- Payloads carry **only** non-descriptive system identifiers: `tenantId`, `facilityId`, `eventId`, and resource UUIDs (`appointmentId`, `invoiceId`).
- If an automated channel (such as transactional email or SMS) must alert an individual, the message text MUST be generic:  
  *Compliant:* `"A new message is waiting in your secure patient portal. Please log in at https://health.logicintelligencetechnologies.in to view."*  
  *Non-Compliant (Illegal Breach):* *"Your Blood Glucose lab results from Dr. Sharma are ready. Result: 185 mg/dL (High)."*

---

## 3. Healthcare Automation Touchpoints (HLT-01 through HLT-06)

The Healthcare Platform exposes six governed automation integration points (HLT-01 through HLT-06). Each touchpoint utilizes scoped, authenticated API boundaries and opaque identifiers.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      HLT-01 THROUGH HLT-06 INTEGRATION MATRIX                   │
└─────────────────────────────────────────────────────────────────────────────────┘

  HLT-01: Intake & Scheduling        ──► [ Opaque Slot Booking Notification ]
  HLT-02: Discharge & Transition     ──► [ Post-Encounter Survey / Outbox Dispatch ]
  HLT-03: Diagnostic & Lab Triggers  ──► [ Generic "Results Ready" Portal Alert ]
  HLT-04: Billing & Reconciliation   ──► [ Razorpay Ledger Settlement & Receipts ]
  HLT-05: Telehealth Coordination    ──► [ Scoped Session Bridge & Clean .ics ]
  HLT-06: Emergency Roster Dispatch  ──► [ On-Call Clinician Paging (No PHI) ]
```

---

### HLT-01: Patient Intake & Appointment Scheduling Synchronization

- **Scope & Objective**: Triggered when a patient reserves or reschedules an appointment slot. Synchronizes slot availability and updates facility calendar capacity.
- **Trigger Source**: Healthcare Platform Booking Engine (`lit-smart-hospital-platform`).
- **Opaque Webhook Payload**:
  ```json
  {
    "eventId": "c7a8b9d0-1111-4000-8000-000000000001",
    "eventType": "healthcare.appointment.reserved",
    "timestamp": 1791624000,
    "payload": {
      "tenantId": "e0a1b2c3-0000-4000-a000-000000000001",
      "facilityId": "f1a2b3c4-0000-4000-b000-000000000002",
      "appointmentId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "slotStartUtc": "2026-10-15T09:30:00Z",
      "slotEndUtc": "2026-10-15T10:00:00Z",
      "serviceType": "general_consultation"
    }
  }
  ```
- **Boundary Rules**:
  - `patientId`, patient names, and symptoms are completely omitted.
  - The calendar sync node receives only UTC instants and facility identifiers.
  - Generates neutral `.ics` calendar invitation stating: `"LIT Healthcare Consultation"`.

---

### HLT-02: Patient Discharge & Care Transition Notifications

- **Scope & Objective**: Orchestrates post-discharge administrative workflows, facility bed turnover alerts, and automated dispatch of patient satisfaction surveys.
- **Trigger Source**: Clinician discharge authorization in HMIS inpatient module.
- **Opaque Webhook Payload**:
  ```json
  {
    "eventId": "c7a8b9d0-2222-4000-8000-000000000002",
    "eventType": "healthcare.encounter.discharged",
    "timestamp": 1791627600,
    "payload": {
      "tenantId": "e0a1b2c3-0000-4000-a000-000000000001",
      "facilityId": "f1a2b3c4-0000-4000-b000-000000000002",
      "encounterId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      "dischargedAtUtc": "2026-10-15T10:30:00Z",
      "outreachType": "post_discharge_satisfaction"
    }
  }
  ```
- **Boundary Rules**:
  - Discharge summaries, medical instructions, diagnoses, and medication regimens remain strictly sealed inside the HIPAA database.
  - The automation engine routes a survey dispatch event to the transactional outbox with an opaque, one-time survey token.

---

### HLT-03: Diagnostic & Laboratory Order Notification Triggers

- **Scope & Objective**: Notifies the patient portal and ordering physician when clinical laboratory or imaging tests have been reviewed and finalized by the lab director.
- **Trigger Source**: Laboratory Information System (LIS) order state change.
- **Opaque Webhook Payload**:
  ```json
  {
    "eventId": "c7a8b9d0-3333-4000-8000-000000000003",
    "eventType": "healthcare.diagnostic.ready",
    "timestamp": 1791631200,
    "payload": {
      "tenantId": "e0a1b2c3-0000-4000-a000-000000000001",
      "facilityId": "f1a2b3c4-0000-4000-b000-000000000002",
      "orderId": "d3e4f5a6-b7c8-4d9e-0f1a-2b3c4d5e6f7a",
      "category": "laboratory",
      "status": "finalized"
    }
  }
  ```
- **Boundary Rules**:
  - **Zero clinical data**: No test names (e.g., "Lipid Panel", "Biopsy"), no numerical values, no reference ranges, and no pathology interpretations.
  - Notification payload triggers an generic transactional notification: *"Your recent test results are now available for review in the secure patient portal."*

---

### HLT-04: Billing, Invoicing & Razorpay Payment Reconciliation

- **Scope & Objective**: Reconciles outpatient consultation deposits, procedure fees, and enterprise hospital subscription billing against Razorpay settlement webhooks.
- **Trigger Source**: Healthcare Platform Billing Module & Razorpay Webhook Gateway.
- **Opaque Webhook Payload**:
  ```json
  {
    "eventId": "c7a8b9d0-4444-4000-8000-000000000004",
    "eventType": "healthcare.billing.payment_captured",
    "timestamp": 1791634800,
    "payload": {
      "tenantId": "e0a1b2c3-0000-4000-a000-000000000001",
      "invoiceId": "e4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7a8b",
      "razorpayPaymentId": "pay_Q8x9Yz12345678",
      "amountInPaise": 150000,
      "currency": "INR",
      "reconciliationStatus": "captured"
    }
  }
  ```
- **Boundary Rules**:
  - Medical codes (CPT, ICD, itemized medical supply lists) are prohibited from the billing synchronization payload.
  - Only monetary quantities, currency, transaction hashes, and invoice UUIDs are processed.
  - Razorpay webhooks MUST be validated server-side using `RAZORPAY_WEBHOOK_SECRET` before updating payment state.

---

### HLT-05: Teleconsultation Session Coordination

- **Scope & Objective**: Dynamically coordinates WebRTC / meeting room bridges between verified clinicians and enrolled patients.
- **Trigger Source**: Confirmed teleconsultation booking.
- **Opaque Webhook Payload**:
  ```json
  {
    "eventId": "c7a8b9d0-5555-4000-8000-000000000005",
    "eventType": "healthcare.telehealth.room_provision",
    "timestamp": 1791638400,
    "payload": {
      "tenantId": "e0a1b2c3-0000-4000-a000-000000000001",
      "facilityId": "f1a2b3c4-0000-4000-b000-000000000002",
      "sessionId": "f5a6b7c8-d9e0-4f1a-2b3c-4d5e6f7a8b9c",
      "scheduledStartUtc": "2026-10-15T11:00:00Z",
      "scheduledDurationMinutes": 30
    }
  }
  ```
- **Boundary Rules**:
  - The automation engine invokes a scoped video API to obtain an encrypted, time-limited room token.
  - Meeting invitations contain no doctor specialization (e.g., "Oncology", "Psychiatry") to avoid health condition inference.

---

### HLT-06: Emergency Roster & Staff Duty Alert Dispatch

- **Scope & Objective**: High-priority alert routing for emergency room coverage, code escalations, and critical shift reassignment across hospital departments.
- **Trigger Source**: Hospital Duty Coordinator or automated on-call escalation rules.
- **Opaque Webhook Payload**:
  ```json
  {
    "eventId": "c7a8b9d0-6666-4000-8000-000000000006",
    "eventType": "healthcare.roster.duty_escalation",
    "timestamp": 1791642000,
    "payload": {
      "tenantId": "e0a1b2c3-0000-4000-a000-000000000001",
      "facilityId": "f1a2b3c4-0000-4000-b000-000000000002",
      "departmentId": "a6b7c8d9-e0f1-4a2b-3c4d-5e6f7a8b9c0d",
      "urgencyLevel": "level_1_critical",
      "roleRequired": "duty_intensivist"
    }
  }
  ```
- **Boundary Rules**:
  - Patient identifiers and clinical vitals causing the code escalation are strictly excluded from the notification.
  - Alert message sent to clinician mobile: *"EMERGENCY: Urgent coverage required in ICU Ward B (Facility 01). Report to duty station immediately."*

---

## 4. Inviolable List of Prohibited Automation Actions

Any automation flow, script, n8n node, or background worker that attempts or performs any of the following six actions is immediately classified as a **Severe Security Violation (P0)**, triggering automated pipeline termination, system lockdown, and compliance incident filing:

### 1. Automated Diagnosing
Automated workflows, LLMs, or rule engines MUST NEVER formulate, suggest, or record a medical diagnosis, clinical inference, or differential diagnosis in patient charts. Diagnostic authority is legally restricted to verified, licensed clinicians authenticated via active sessions.

### 2. Automated Prescribing
Automation pipelines MUST NEVER generate, issue, dispense, or modify drug prescriptions, dosage levels, or medication refills. Prescription generation requires cryptographic digital signatures from licensed physicians.

### 3. Modifying Clinical Records
Clinical encounter notes, vital signs, lab reports, surgical logs, and nursing entries are immutable to automation. Automation workers have **ZERO write permissions** to clinical tables (`encounters`, `observations`, `lab_results`, `prescriptions`).

### 4. Merging Patients by Email
The automation system MUST NEVER link, associate, or merge a new user login or existing clinical record based solely on email or phone number equality. In healthcare, shared family emails (e.g., parents managing dependents) are common; automated merging causes catastrophic record pollution and HIPAA cross-disclosure. All record linkages require explicit administrator review with Medical Record Number (MRN) verification.

### 5. Confirming Bookings Without Payment Proof
Appointments requiring pre-payment or deposits MUST NEVER transition to `"confirmed"` status via automated assumptions. Confirmation requires verified, cryptographically signed Razorpay webhook capture (`razorpay_signature`) validated server-side. Browser redirects or client callbacks alone are explicitly rejected.

### 6. Bypassing PostgreSQL Row-Level Security (RLS)
Automation processes MUST NEVER execute queries utilizing bypass flags, database superuser roles (`postgres`), or connection strings that circumvent PostgreSQL RLS policies. Every database query executed on behalf of healthcare automation must bind explicit tenant credentials (`SET LOCAL app.current_tenant_id = '...'`).

---

## 5. Security Perimeter Isolation & Database Defenses

### 5.1 Dual Database Segregation

The Corporate and Healthcare platforms reside on physically distinct database clusters with isolated credential stores:

| Parameter | Corporate Platform | Healthcare Platform |
|---|---|---|
| **Database Instance** | Corporate Supabase Project | Dedicated Healthcare Supabase Instance |
| **Data Types** | Leads, CRM, Corporate Contracts, Public CMS | Organizations, Facilities, Patients, Encounters, Orders |
| **Service Role Key** | `SUPABASE_SERVICE_ROLE_KEY` | `HEALTHCARE_SUPABASE_SERVICE_ROLE_KEY` |
| **Cross-Access** | Completely denied. No network peering. | Completely denied. No shared credentials. |
| **RLS Status** | `ENABLE ROW LEVEL SECURITY; FORCE` | `ENABLE ROW LEVEL SECURITY; FORCE` |

### 5.2 Private Schema Containment (`lit_private`)

Sensitive operational data, pending patient link reviews, and private invitations within the Healthcare Platform are housed in a dedicated schema (`lit_private`) stripped of all standard database privileges:

```sql
-- Explicit deny-all posture on sensitive healthcare staging tables
REVOKE ALL ON ALL TABLES IN SCHEMA lit_private FROM anon, authenticated, public;
-- Access strictly limited to authenticated backend application roles via SECURITY DEFINER functions
```

### 5.3 Payload Validation & Sanitization Pipeline

Before any event is dispatched to an automation queue, an automated scanner validates that zero PHI patterns exist within the payload:

```typescript
// Sanitization Gate: Fails closed if prohibited fields or PII patterns are detected
export function assertHealthcarePayloadCompliant(payload: Record<string, unknown>): void {
  const BANNED_KEYS = [
    "name", "patient_name", "first_name", "last_name", "dob", "birth_date",
    "ssn", "aadhaar", "diagnosis", "icd10", "prescription", "rx", "lab_result",
    "clinical_notes", "vitals", "blood_pressure", "symptoms"
  ];

  const serialized = JSON.stringify(payload).toLowerCase();
  for (const key of BANNED_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload, key) || serialized.includes(`"${key}"`)) {
      throw new Error(`CRITICAL_SECURITY_BREACH: Prohibited PHI key '${key}' detected in automation payload`);
    }
  }
}
```

---

## 6. Audit & Accountability Logging

In compliance with HIPAA 45 CFR § 164.312(b), all healthcare automation dispatch and response events are logged with immutable cryptographic hashes:
- Every event records `event_id`, `tenant_id`, `facility_id`, `actor_type` (`"automation_engine"`), and an immutable SHA-256 digest of the request/response payload.
- Audit logs are written to an append-only, tamper-evident table protected by PostgreSQL triggers preventing `UPDATE` or `DELETE` actions.
- Audit records are retained for a minimum of **seven (7) years** in accordance with medical record retention regulations.
