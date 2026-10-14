# LIT Enterprise Email Template Inventory & Design System v2

This document provides the authoritative cross-site catalog of every approved email template, event trigger, recipient audience, sender address, and delivery contract across Logic Intelligence Technologies (Corporate LIT), LIT Smart Hospital Platform, Logic Voice, VoiceShield, and n8n orchestration.

---

## 1. Design Token Contract (v1 vs v2)

| Property | LIT Email v1 (Legacy) | LIT Email v2 (Authoritative Enterprise Standard) | Rationale |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | Sandal / Parchment `#F5F1E7` | Cloud Canvas `#F7F9FC` | Clean, modern corporate feel; high readability across clients |
| **Card Background** | `#FFFFFF` | `#FFFFFF` | Crisp white document card |
| **Card Max Width** | 680px | 620px (centered) | Optimized for desktop email clients & mobile reading width |
| **Card Radius** | 8px | 12px | Modern rounded card container matching website design |
| **Card Border** | `#E5E7EB` | `1px solid #DFE7EF` | Subtle structural definition |
| **Header Layout** | Text-heavy or dark banner `#0d2d50` | Centered 64x64px Logo + Wordmark + Optional Sub-Brand | Uniform corporate identity across all products |
| **Primary Navy** | `#111827` (almost black) | `#0B2545` (Corporate Deep Navy) | Aligns with official brand palette |
| **Primary Action Blue** | `#2563EB` | `#1565C0` (Corporate Action Blue) | Brand action color for primary CTAs |
| **Accent Teal** | `#087f83` / `#087d80` | `#1FA9A2` (Selective Accent Teal) | Highlighting badges, active indicators, and secondary CTAs |
| **Typography** | IBM Plex Sans | Poppins (`'Poppins', Arial, Helvetica, sans-serif`) | Brand font matching official corporate web properties |
| **Monospace Font** | JetBrains Mono | JetBrains Mono (`Consolas, Menlo, monospace`) | Code, tokens, and references |
| **Button Standard** | Pill or square dark buttons | 8px rounded `#1565C0` with 44px touch target & text fallback | High contrast, accessible, reliable across Gmail & Outlook |
| **Security & PHI** | Ad-hoc confidentiality notes | Strictly ZERO PHI, no patient clinical details, verified links | HIPAA compliance, patient safety, anti-spoofing |

---

## 2. Complete Cross-Site Template Catalog

| Key / Template | Originating Property | Recipient Audience | Sender Address | Reply-To | Subject Pattern | Primary CTA Destination | Legal Class | PHI Sensitivity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `new-lead-notification` | LIT-CORP | Admin / Founder | `hello@logicintelligencetechnologies.in` | Client Email | `New website enquiry: {fullName}` | `/admin/command-center` | Transactional | NONE | VERIFIED |
| `lead-confirmation` | LIT-CORP | Prospective Client | `hello@logicintelligencetechnologies.in` | `hello@...` | `We received your message | Logic Intelligence Technologies` | `/services` | Lifecycle | NONE | VERIFIED |
| `welcome` | LIT-CORP | New Client / User | `hello@logicintelligencetechnologies.in` | `hello@...` | `Welcome to Logic Intelligence Technologies` | `/dashboard` | Lifecycle | NONE | VERIFIED |
| `invoice` | LIT-CORP | Client Finance | `billing@logicintelligencetechnologies.in` | `billing@...` | `Invoice {invoiceNumber} from Logic Intelligence Technologies` | `/billing/{invoiceNumber}` | Billing | NONE | VERIFIED |
| `payment-received` | LIT-CORP | Client Finance | `billing@logicintelligencetechnologies.in` | `billing@...` | `Payment received — thank you` | `/dashboard` | Billing | NONE | VERIFIED |
| `newsletter-confirmation`| LIT-CORP | Subscriber | `newsletter@logicintelligencetechnologies.in` | `no-reply@...`| `Subscription confirmed` | `/resources` | Marketing | NONE | VERIFIED |
| `newsletter-double-optin`| LIT-CORP | Subscriber | `newsletter@logicintelligencetechnologies.in` | `no-reply@...`| `Confirm your newsletter subscription` | `/newsletter/confirm?token=...` | Transactional | NONE | VERIFIED |
| `password-reset` | LIT-CORP | User | `security@logicintelligencetechnologies.in` | `no-reply@...`| `Reset your password` | `/auth/reset-password?token=...`| Security | NONE | VERIFIED |
| `login-notification` | LIT-CORP | User | `security@logicintelligencetechnologies.in` | `security@...`| `New login from {device}` | `/account/security` | Security | NONE | VERIFIED |
| `free-demo-confirmation`| LIT-CORP | Prospective Client | `hello@logicintelligencetechnologies.in` | `hello@...` | `Demo requested: {product}` | `/demos` | Lifecycle | NONE | VERIFIED |
| `demo-ready` | LIT-CORP | Client | `hello@logicintelligencetechnologies.in` | `hello@...` | `Your demo is ready` | `/demos/{demoId}` | Lifecycle | NONE | VERIFIED |
| `proposal-sent` | LIT-CORP | Client Sponsor | `hello@logicintelligencetechnologies.in` | `hello@...` | `Proposal: {proposalTitle}` | `/proposals/{proposalId}` | Commercial | NONE | VERIFIED |
| `project-kickoff` | LIT-CORP | Client Team | `delivery@logicintelligencetechnologies.in` | `delivery@...`| `Project kickoff: {projectName}` | `/projects/{projectId}` | Operational | NONE | VERIFIED |
| `project-delivered` | LIT-CORP | Client Team | `delivery@logicintelligencetechnologies.in` | `delivery@...`| `Project delivery milestone: {projectName}`| `/projects/{projectId}` | Operational | NONE | VERIFIED |
| `maintenance-renewal` | LIT-CORP | Client Ops | `billing@logicintelligencetechnologies.in` | `billing@...` | `Maintenance renewal notice: {service}` | `/billing` | Billing | NONE | VERIFIED |
| `enterprise-checklist-invitation` | LIT-CORP | Client Lead / Sponsor | `hello@logicintelligencetechnologies.in` | `hello@...` | `Review: 50-Point Enterprise Deployment Checklist` | `/checklist/{token}` | Commercial | NONE | VERIFIED |
| `enterprise-checklist-submission-receipt` | LIT-CORP | Client Lead | `hello@logicintelligencetechnologies.in` | `hello@...` | `Checklist Selections Confirmed ({reference})` | `/checklist/receipt/{reference}` | Commercial | NONE | VERIFIED |
| `enterprise-checklist-admin-alert` | LIT-CORP | Founder / Admin | `system@logicintelligencetechnologies.in` | Client Email | `Checklist Submission: {company} ({count} pts)` | `/admin/proposals/checklist-review?ref=...`| Operational | NONE | VERIFIED |
| `checklist-download` | LIT-CORP | Client Lead | `hello@logicintelligencetechnologies.in` | `hello@...` | `Your 50-Point Deployment Checklist PDF` | `/resources/checklist.pdf` | Commercial | NONE | VERIFIED |
| `checklist-submission` | LIT-CORP | Internal Ops | `hello@logicintelligencetechnologies.in` | Client Email | `Checklist review submitted by {fullName}` | `/admin/checklist` | Operational | NONE | VERIFIED |
| `testimonial-request` | LIT-CORP | Client | `hello@logicintelligencetechnologies.in` | `hello@...` | `How was your experience with Logic Intelligence Technologies?` | `/feedback` | Marketing | NONE | VERIFIED |
| `job-application` | LIT-CORP | Candidate | `careers@logicintelligencetechnologies.in` | `careers@...` | `Application received — {role}` | `/careers` | HR | NONE | VERIFIED |
| `resource-access` | LIT-CORP | User | `resources@logicintelligencetechnologies.in` | `no-reply@...`| `Your resource is ready: {title}` | `/resources/{id}` | Transactional | NONE | VERIFIED |
| `resource-delivery` | LIT-CORP | User | `resources@logicintelligencetechnologies.in` | `no-reply@...`| `{title} from Logic Intelligence Technologies` | `/resources` | Transactional | NONE | VERIFIED |
| `weekly-recognition` | LIT-CORP | Team Member | `team@logicintelligencetechnologies.in` | `team@...` | `Weekly recognition: {recipient}` | `/team/recognition` | Internal | NONE | VERIFIED |
| `outreach-sequence` | LIT-CORP | Prospect | `vikash@logicintelligencetechnologies.in` | `vikash@...` | `{subject}` | `/contact` | Commercial | NONE | VERIFIED |
| `broadcast` | LIT-CORP | All Clients | `announcements@logicintelligencetechnologies.in` | `no-reply@...`| `{subject}` | `/announcements` | Informational | NONE | VERIFIED |
| `admin-generic` | LIT-CORP | Admin | `system@logicintelligencetechnologies.in` | `system@...` | `{subject}` | `/admin` | Operational | NONE | VERIFIED |
| `hospital_email_confirmation` | LIT-HEALTH | Healthcare Staff / Admin | `no-reply@logicintelligencetechnologies.in` | `support@...` | `Confirm your email | Logic Intelligence Technologies` | `{{ .ConfirmationURL }}` | Security | NONE (Strictly zero clinical data) | VERIFIED |
| `hospital_recovery` | LIT-HEALTH | Healthcare Staff / Admin | `no-reply@logicintelligencetechnologies.in` | `support@...` | `Reset your password | Logic Intelligence Technologies` | `{{ .ConfirmationURL }}` | Security | NONE (Strictly zero clinical data) | VERIFIED |
| `hospital_account_activation`| LIT-HEALTH | Healthcare Staff / Admin | `no-reply@logicintelligencetechnologies.in` | `support@...` | `Activate your hospital platform account` | `/auth/activate?token=...` | Security | NONE (Strictly zero clinical data) | VERIFIED |
| `logic_voice_incident_alert`| LIT-VOICE | Platform Admin | `alerts@logicintelligencetechnologies.in` | `alerts@...` | `[Logic Voice] Security/Latency alert: {event}` | `/admin/voice-metrics` | Security | NONE | VERIFIED |
| `voiceshield_anomaly_alert`| VOICESHIELD | Security Ops | `security@logicintelligencetechnologies.in` | `security@...` | `[VoiceShield] Synthetic Voice Detection Anomaly` | `/admin/voiceshield/forensics` | Security | NONE (Audio waveforms/hash only) | VERIFIED |
| `n8n_lead_sync_alert` | N8N | CRM Ops | `system@logicintelligencetechnologies.in` | `system@...` | `[n8n] Lead Ingestion & Verification Notice` | `/admin/emails/n8n` | Operational | NONE | VERIFIED |

---

## 3. Strict Quality & Delivery Standards

1. **No Broken Formatting**:
   - Every email renders inside a centered `620px` card container.
   - Canvas background is `#F7F9FC`, card background is `#FFFFFF`, border is `1px solid #DFE7EF`.
   - Typography uses Poppins with system font fallbacks (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif`).
2. **Logo & Wordmark**:
   - Official centered circular logo (64x64px) at top of every template: `https://www.logicintelligencetechnologies.in/assets/logo-icon.jpg`.
   - Wordmark `LOGIC INTELLIGENCE TECHNOLOGIES` in `#0B2545` uppercase with optional sub-brand text.
3. **Buttons & Plain Link Fallbacks**:
   - Every primary action button uses `#1565C0` background with white text and 8px border radius.
   - For all security and critical transactional emails, a plain link fallback is included beneath the button.
4. **Zero PHI Guarantee**:
   - No medical records, diagnostic details, medication names, clinical findings, or patient health information are ever placed in email bodies or subject lines.
   - Notifications contain only generic account status or secure portal invitation links.
5. **DKIM / SPF / DMARC Compliance**:
   - All outgoing emails pass through authorized Zoho Mail SMTP infrastructure or verified transactional outbox.
   - Strict `p=reject` or `p=quarantine` DMARC alignment.
