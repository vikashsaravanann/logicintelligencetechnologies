# Workflow Risk, Activation, and Approval Policy Matrix
**Program:** LIT Four-Site Unified Automation Command Center  
**Coordinator:** A00 Master Orchestrator | A11 Approvals & Governance Lead  

## 1. Risk Tier Definitions

| Risk Tier | Class Name | Impact Profile | Human Sign-Off Required | Allowed Execution Mode |
|---|---|---|---|---|
| **R0** | Monitoring & Inspection | Read-only telemetry, uptime probes, sitemap validation, GSC URL inspection | No (Automated once configured) | Scheduled / Manual Trigger |
| **R1** | Internal Notifications | Internal team alerts, daily/weekly reliability digests, operational warning pings | Site Lead Review | Scheduled / Event Driven |
| **R2** | Customer Communication | Transactional emails, inquiry routing, booking confirmations, onboarding notices | Product Owner Approval | Outbox / Event Driven |
| **R3** | Security, Credentials & CDN | Role grants, session revocation, API key rotation reminders, selective CDN purges | Dual-Control Super Admin | Explicit Human Authorization |
| **R4** | Regulated / Financial Actions | Invoice dispatch, payment reconciliation, data retention purge, cold outreach | Executive / Legal Sign-off | Staged & Guarded Execution |

---

## 2. Activation State Lifecycle
Under no circumstances may a workflow transition directly from code repository into live production execution. Every workflow moves through this linear state machine:

```
[SOURCE_PRESENT]
       ↓
[DEPENDENCY_VERIFIED]  (Credentials, Webhook secret, and DB tables configured)
       ↓
[SECURITY_TESTED]      (HMAC fail-closed test & payload sanitization verified)
       ↓
[STAGING_TESTED]       (Dry run executed in staging environment)
       ↓
[POLICY_APPROVED]      (Authorized role recorded in automation_approval_decisions)
       ↓
[READY_FOR_ACTIVATION] (Tagged with Git commit SHA and deployment version)
       ↓
[ACTIVE]               (Enabled on n8n server with monitored health checks)
```

---

## 3. Approval Authority Matrix

| Action | Minimum Staff Role Required | Second Approver Required | Audit Retention Period |
|---|---|---|---|
| View telemetry / catalog | `viewer` | No | 90 days |
| Trigger R0 inspection / probe | `operator` | No | 180 days |
| Trigger R1 notification test | `operator` | No | 180 days |
| Activate R2 customer workflow | `admin` | Yes (`super_admin`) | 1 year |
| Pause / Rollback any workflow | `admin` | No (Fail-safe action) | 3 years |
| Selective CDN Cache Invalidation | `admin` | Yes (`super_admin`) | 3 years |
| Activate R3 security workflow | `super_admin` | Yes (`super_admin` secondary) | 7 years |
| Activate R4 financial/outreach | `super_admin` | Yes (Corporate Officer) | 7 years |
