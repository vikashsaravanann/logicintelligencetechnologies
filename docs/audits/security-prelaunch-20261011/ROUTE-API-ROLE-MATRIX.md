# Route, API, and Role-Based Access Control (RBAC) Matrix

**Target System:** Logic Intelligence Technologies Corporate Platform  
**Auditor:** Subagent A01/A02 — Corporate Platform Security & Pre-Launch Lead  
**Audit Date:** October 11, 2026  
**Build Status:** Verified (112 / 112 Production App Routes Compiled Successfully)  

---

## 1. Overview & Classification Schema

The platform strictly delineates access into five discrete permission tiers:
1. **Tier 1 — Public (`PUBLIC`):** Unauthenticated anonymous access; cacheable marketing pages, legal disclosures, static docs, and public asset generators.
2. **Tier 2 — Client Authenticated (`CLIENT`):** Requires verified Supabase session token (`supabase.auth.getUser()`); multi-tenant RLS guarantees data isolation by `organization_id`.
3. **Tier 3 — Staff RBAC (`STAFF`):** Internal employees with verified roles (`super_admin`, `admin`, `operations`, `support`, `developer`, `viewer`).
4. **Tier 4 — Super Admin Exclusive (`SUPER_ADMIN`):** Highest privilege tier; capable of role alterations, credential management, and destructive actions.
5. **Tier 5 — Internal Service / Webhook (`SERVICE`):** Protected by cryptographic HMAC signatures (`X-Automation-Signature`) or service role secrets.

---

## 2. Public Marketing & SSG Routes (Tier 1)

All public routes are statically prerendered (`○`) or incrementally generated via static parameters (`●`).

| Route Path | Type | HTTP Method | Access Tier | Description & Risk Analysis |
| :--- | :---: | :---: | :---: | :--- |
| `/` | Static `○` | GET | `PUBLIC` | Corporate homepage, value propositions, service highlights. |
| `/about` | Static `○` | GET | `PUBLIC` | Company mission, leadership profiles, security commitments. |
| `/about/founder` | Static `○` | GET | `PUBLIC` | Executive biography, verified credentials, decoded headshot. |
| `/accessibility` | Static `○` | GET | `PUBLIC` | WCAG 2.2 AA statement, contact information for accommodations. |
| `/ai` | Static `○` | GET | `PUBLIC` | AI engineering overview, sovereign model architectures. |
| `/ai-assistant` | Static `○` | GET | `PUBLIC` | Interactive chatbot landing surface, Groq demo interface. |
| `/ai-discovery` | Static `○` | GET | `PUBLIC` | Interactive discovery assessment tool for enterprise prospects. |
| `/ai-ethics` | Static `○` | GET | `PUBLIC` | Ethical AI Charter, bias mitigation, human-in-the-loop policies. |
| `/architecture` | Static `○` | GET | `PUBLIC` | High-throughput systems architecture, edge topologies. |
| `/blog` | Static `○` | GET | `PUBLIC` | Technical engineering publication index. |
| `/blog/[slug]` | SSG `●` | GET | `PUBLIC` | Long-form technical articles, sanitized Markdown rendering. |
| `/book-consultation` | Static `○` | GET | `PUBLIC` | Enterprise consultation booking interface. |
| `/booking/cancelled` | Static `○` | GET | `PUBLIC` | Appointment cancellation acknowledgement. |
| `/booking/success` | Dynamic `ƒ` | GET | `PUBLIC` | Appointment confirmation with sanitized reference token. |
| `/careers` | Static `○` | GET | `PUBLIC` | Open career positions and engineering hiring values. |
| `/certifications` | Static `○` | GET | `PUBLIC` | SOC 2 Type II, ISO 27001, and HIPAA compliance attestations. |
| `/checklist` | Static `○` | GET | `PUBLIC` | Pre-launch and migration checklist for prospects. |
| `/community` | Static `○` | GET | `PUBLIC` | Open-source initiatives, academic partnerships. |
| `/company/facts` | Static `○` | GET | `PUBLIC` | Verified corporate facts, jurisdiction, registered offices. |
| `/contact` | Static `○` | GET | `PUBLIC` | Secure contact form with rate-limited submission endpoint. |
| `/cookie-policy` | Static `○` | GET | `PUBLIC` | Strict disclosure of zero-third-party tracking cookies. |
| `/discovery` | Static `○` | GET | `PUBLIC` | Client technology discovery workflow portal. |
| `/docs/api` | Static `○` | GET | `PUBLIC` | Public API documentation and SDK references. |
| `/expertise` | Static `○` | GET | `PUBLIC` | Core domain expertise: AI, High-Throughput, Sovereign Cloud. |
| `/free-demo` | Static `○` | GET | `PUBLIC` | Product demonstration request interface. |
| `/healthcare` | Static `○` | GET | `PUBLIC` | Healthcare solutions: HIPAA, VoiceShield, clinical workflows. |
| `/healthcare/plans` | Static `○` | GET | `PUBLIC` | Specialized healthcare tier breakdown. |
| `/help-center` | Static `○` | GET | `PUBLIC` | Public knowledge base and self-service troubleshooting. |
| `/industries` | Static `○` | GET | `PUBLIC` | Industry vertical solutions catalog. |
| `/industries/[slug]` | SSG `●` | GET | `PUBLIC` | Tailored vertical pages: Healthcare, Education, Retail, etc. |
| `/investor-brief` | Static `○` | GET | `PUBLIC` | Corporate financial, architectural, and traction summary. |
| `/investors` | Static `○` | GET | `PUBLIC` | Investor relations and institutional governance overview. |
| `/jobs` | Static `○` | GET | `PUBLIC` | Job listing directory. |
| `/knowledge-base` | Static `○` | GET | `PUBLIC` | Technical knowledge articles. |
| `/login` | Static `○` | GET | `PUBLIC` | Secure client & staff authentication gateway. |
| `/packages` | Static `○` | GET | `PUBLIC` | Fixed-scope technology deployment packages. |
| `/packages/[slug]` | SSG `●` | GET | `PUBLIC` | Package detail pages (Digital Launch, Business Pro, etc.). |
| `/press` | Static `○` | GET | `PUBLIC` | Official press releases and media kit assets. |
| `/pricing` | Static `○` | GET | `PUBLIC` | Transparent enterprise pricing models. |
| `/privacy` / `/privacy-policy` | Static `○` | GET | `PUBLIC` | GDPR/CCPA compliant privacy declaration. |
| `/products` | Static `○` | GET | `PUBLIC` | Enterprise software product catalog. |
| `/products/[slug]` | SSG `●` | GET | `PUBLIC` | Product deep-dives: Logic Voice, VoiceShield, Nexus CRM. |
| `/products/facts` | Static `○` | GET | `PUBLIC` | Technical specification matrix for LIT software suites. |
| `/proposal/[secureToken]` | Dynamic `ƒ` | GET | `PUBLIC / TOKEN` | Cryptographically signed client proposal review surface. |
| `/refund-policy` | Static `○` | GET | `PUBLIC` | Enterprise service-level and refund policies. |
| `/reset-password` | Static `○` | GET | `PUBLIC` | Self-service password recovery initiation. |
| `/resources` | Static `○` | GET | `PUBLIC` | Whitepapers, technical blueprints, architecture diagrams. |
| `/resources/[slug]` | Dynamic `ƒ` | GET | `PUBLIC` | Resource landing pages with gated access download forms. |
| `/robots.txt` | Static `○` | GET | `PUBLIC` | Crawler instruction file disallowing sensitive directories. |
| `/roi-calculator` | Static `○` | GET | `PUBLIC` | Client AI implementation ROI modeling tool. |
| `/sales` | Static `○` | GET | `PUBLIC` | Enterprise sales inquiry interface. |
| `/security` | Static `○` | GET | `PUBLIC` | Platform security architecture, bug bounty, vulnerability reporting. |
| `/services` | Static `○` | GET | `PUBLIC` | Comprehensive service catalog. |
| `/services/[slug]` | Dynamic `ƒ` | GET | `PUBLIC` | In-depth engineering service specifications. |
| `/sitemap.xml` | Static `○` | GET | `PUBLIC` | Dynamic search engine index containing 44+ verified URLs. |
| `/support` | Static `○` | GET | `PUBLIC` | Public support triage portal. |
| `/support/new` | Static `○` | GET | `PUBLIC` | New support ticket initiation form. |
| `/terms` / `/terms-of-service` | Static `○` | GET | `PUBLIC` | Master service agreement terms of use. |
| `/voice-shield` | Static `○` | GET | `PUBLIC` | VoiceShield low-latency deepfake defense overview. |
| `/work` | Static `○` | GET | `PUBLIC` | Client case studies portfolio index. |
| `/work/[slug]` | SSG `●` | GET | `PUBLIC` | Case study deep-dives: FreshBite, VaultHR, Luxe Interiors. |

---

## 3. Authenticated Client Portal Routes (Tier 2 — `CLIENT`)

Protected by `src/middleware.ts` (`isProtectedPath`). Enforces verified Supabase authentication and organization multi-tenancy.

| Route Path | Type | HTTP Method | Required Role | Tenant Isolation Enforced |
| :--- | :---: | :---: | :---: | :--- |
| `/client/dashboard` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | Organization scope via `profiles.organization_id`. |
| `/client/documents` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | Vault documents restricted by `organization_id` RLS. |
| `/client/invoices` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | Billing records scoped strictly to client organization. |
| `/client/login` | Static `○` | GET | `PUBLIC` | Dedicated client login interface with redirect handling. |
| `/client/messages` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | Encrypted real-time thread messages. |
| `/client/profile` | Static `○` | GET | `CLIENT` / `STAFF` | Profile self-management (name, phone; role immutable). |
| `/client/projects` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | Active engineering milestones and deliverables. |
| `/client/projects/[id]` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | Specific milestone deep-dive with file upload limits. |
| `/client/support` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | Client ticket queue and SLA escalation. |
| `/onboard` | Dynamic `ƒ` | GET | `CLIENT` | New enterprise client intake and organization binding. |
| `/profile` | Dynamic `ƒ` | GET | `CLIENT` / `STAFF` | User account settings and notification preferences. |

---

## 4. Corporate Administrative Portal Routes (Tier 3 & 4 — `STAFF` / `SUPER_ADMIN`)

Protected by `src/middleware.ts` (`isCompanyOnlyPath`) and `src/lib/auth/require-admin.ts`. Requires explicit staff role stored in `profiles.role`.

| Route Path | Type | HTTP Method | Required Role | Capability / Risk Analysis |
| :--- | :---: | :---: | :---: | :--- |
| `/admin` | Dynamic `ƒ` | GET | `viewer`+ | Executive overview, operational metrics summary. |
| `/admin/ai-leads` | Dynamic `ƒ` | GET | `operations`+ | Groq AI chatbot conversation triage & captured leads. |
| `/admin/analytics` | Dynamic `ƒ` | GET | `admin`+ | Platform performance, conversion funnels, response times. |
| `/admin/audit` | Dynamic `ƒ` | GET | `admin`+ | Comprehensive immutable platform audit log. |
| `/admin/automations` | Dynamic `ƒ` | GET | `developer`+ | n8n workflow monitoring, execution history, webhooks. |
| `/admin/bookings` | Dynamic `ƒ` | GET | `support`+ | Consultation calendar management, reschedule requests. |
| `/admin/clients` | Dynamic `ƒ` | GET | `admin`+ | Client organization directory, tier assignments. |
| `/admin/clients/[id]` | Dynamic `ƒ` | GET | `admin`+ | Client organization settings, RLS configuration. |
| `/admin/command-center` | Dynamic `ƒ` | GET | `super_admin` | Global platform configuration, kill-switches, alerts. |
| `/admin/contracts/[id]/record-signature` | Dynamic `ƒ` | POST/GET | `admin`+ | Digital signature binding and legal archiving. |
| `/admin/documents` | Dynamic `ƒ` | GET | `operations`+ | Enterprise document repository, generated PDF vaults. |
| `/admin/documents/[id]` | Dynamic `ƒ` | GET | `operations`+ | Document metadata editor, access grant controller. |
| `/admin/emails` | Dynamic `ƒ` | GET | `operations`+ | Outbound email queue status, deliverability metrics. |
| `/admin/emails/new` | Dynamic `ƒ` | GET | `admin`+ | Template composer for transactional notifications. |
| `/admin/forbidden` | Dynamic `ƒ` | GET | Any | 403 authorization failure splash view. |
| `/admin/invoices` | Dynamic `ƒ` | GET | `admin`+ | Accounts receivable, Stripe/Stripe-Connect ledger. |
| `/admin/invoices/new` | Dynamic `ƒ` | GET | `admin`+ | Invoice generation and payment link dispatch. |
| `/admin/leads` | Dynamic `ƒ` | GET | `operations`+ | Enterprise prospect CRM records, lead scoring. |
| `/admin/leads/[id]` | Dynamic `ƒ` | GET | `operations`+ | Lead dossier, communication history, meeting notes. |
| `/admin/onboarding` | Dynamic `ƒ` | GET | `operations`+ | Pending client onboarding requests & KYC approvals. |
| `/admin/outreach` | Dynamic `ƒ` | GET | `admin`+ | Cold outreach campaign orchestration dashboard. |
| `/admin/outreach/analytics` | Dynamic `ƒ` | GET | `admin`+ | Open rates, reply rates, bounce rates, spam complaints. |
| `/admin/outreach/compliance` | Dynamic `ƒ` | GET | `admin`+ | Gate 4 & Gate 5 compliance review, jurisdiction audits. |
| `/admin/outreach/playbook` | Dynamic `ƒ` | GET | `admin`+ | Campaign sequence templates, follow-up rules. |
| `/admin/outreach/queue` | Dynamic `ƒ` | GET | `operations`+ | Staged outreach queue awaiting Gate 4 human release. |
| `/admin/outreach/studio` | Dynamic `ƒ` | GET | `admin`+ | AI-assisted message personalization with human edit. |
| `/admin/outreach/suppression` | Dynamic `ƒ` | GET | `admin`+ | Suppression list management (`email_suppressions`). |
| `/admin/proposals` | Dynamic `ƒ` | GET | `admin`+ | Enterprise proposal registry and contract staging. |
| `/admin/proposals/[id]` | Dynamic `ƒ` | GET | `admin`+ | Proposal editor, commercial scope, discount limits. |
| `/admin/proposals/new` | Dynamic `ƒ` | GET | `admin`+ | Proposal builder with automatic PDF compiler. |
| `/admin/status` | Dynamic `ƒ` | GET | `viewer`+ | Live subsystem health checks (Supabase, Groq, Redis). |
| `/admin/support` | Dynamic `ƒ` | GET | `support`+ | Unified support inbox, ticket assignment, SLA clock. |
| `/admin/support/[id]` | Dynamic `ƒ` | GET | `support`+ | Ticket resolution view, internal notes, client replies. |
| `/admin/team` | Dynamic `ƒ` | GET | `super_admin` | Staff RBAC assignment; guarded by DB triggers. |

---

## 5. API Endpoints & Service Handlers (Tier 1–5)

| Endpoint | Method | Access Tier | Validation / Rate Limit | Description & Security Controls |
| :--- | :---: | :---: | :---: | :--- |
| `/api/contact` | `POST` | `PUBLIC` | Zod / 5 req/hr | Contact form submission; dual honeypot, anti-bot. |
| `/api/chat` | `POST` | `PUBLIC` | Zod / 20 req/min | Groq AI streaming assistant; server-side prompt defense. |
| `/api/free-demo` | `POST` | `PUBLIC` | Zod / 5 req/hr | Product demo scheduling with domain verification. |
| `/api/booking` | `POST` | `PUBLIC` | Zod / 10 req/hr | Consultation booking creation; slot lock anti-race. |
| `/api/newsletter` | `POST` | `PUBLIC` | Zod / 5 req/hr | Newsletter subscription with double opt-in verification. |
| `/api/newsletter/confirm` | `GET` | `PUBLIC` | Token verification | Cryptographic token confirmation for newsletter. |
| `/api/unsubscribe` | `POST`/`GET`| `PUBLIC` | Token verification | Instant CAN-SPAM/GDPR suppression recording. |
| `/api/jobs/apply` | `POST` | `PUBLIC` | Zod / 5 req/hr | Career application submission; resume format whitelist. |
| `/api/checklist` | `POST` | `PUBLIC` | Zod / 10 req/hr | Checklist state preservation and download token. |
| `/api/resources/[slug]/download` | `GET` | `PUBLIC / TOKEN` | Slugs whitelist | Verifies public resource eligibility; returns safe PDF. |
| `/api/resources/[slug]/request-access` | `POST` | `PUBLIC` | Zod / 5 req/hr | Gated whitepaper access request; issues download token. |
| `/api/resources/download` | `POST` | `CLIENT` | Supabase RLS | Client vault PDF retrieval; verifies file ownership. |
| `/api/proposals/[token]/view` | `GET` | `TOKEN` | Cryptographic Token | Verifies proposal token; records client view timestamp. |
| `/api/proposals/[token]/approve` | `POST` | `TOKEN` | Cryptographic Token | Digital signature capture; locks proposal against edits. |
| `/api/automation/callback` | `POST` | `SERVICE` | HMAC-SHA256 v1 | Inbound n8n automation callback; 64KB max, 300s window. |
| `/api/webhooks/signup` | `POST` | `SERVICE` | Webhook Secret | User registration event bridge to CRM pipeline. |
| `/api/admin/outreach/campaigns` | `GET`/`POST`| `STAFF` | Zod / `admin`+ | Campaign lifecycle; Gate 4 human approval enforcement. |
| `/api/admin/outreach/leads` | `GET`/`POST`| `STAFF` | Zod / `operations`+ | Outreach prospect management and status updates. |
| `/api/admin/send-trigger` | `POST` | `STAFF` | `admin`+ / Gate 4 | Initiates email dispatch; executes `send-guard.ts`. |
| `/api/admin/smtp-verify` | `POST` | `STAFF` | `admin`+ | Tests outbound SMTP health without sending live email. |
| `/api/admin/automations/import` | `POST` | `STAFF` | `developer`+ | Imports workflow JSON into orchestration engine. |
| `/api/admin/invoices` | `GET`/`POST`| `STAFF` | `admin`+ | Issues invoices; records offline and Stripe payments. |
| `/api/cron/email-outbox` | `POST` | `SERVICE` | `CRON_SECRET` | Scheduled outbox worker; enforces rate throttle. |
| `/api/cron/outreach-followups` | `POST` | `SERVICE` | `CRON_SECRET` | Evaluates reply state before queueing follow-ups. |
| `/api/cron/automation-retry` | `POST` | `SERVICE` | `CRON_SECRET` | Retries failed n8n automation calls with exp backoff. |
| `/api/cron/document-render` | `POST` | `SERVICE` | `CRON_SECRET` | Asynchronous background PDF rendering service. |
| `/api/cron/weekly-recognition`| `POST` | `SERVICE` | `CRON_SECRET` | Staff recognition digest email compilation. |
| `/api/health` | `GET` | `PUBLIC` | Edge Cacheable | Aggregated system health status check. |
| `/api/health/database` | `GET` | `STAFF` / Secret | Direct ping | Supabase PostgreSQL connectivity & query latency. |
| `/api/health/email` | `GET` | `STAFF` / Secret | SMTP ping | Outbound email gateway reachability check. |
| `/api/health/storage` | `GET` | `STAFF` / Secret | S3/Supabase ping | Client vault object storage bucket read/write check. |
| `/api/health/calendar` | `GET` | `STAFF` / Secret | Calendar API | Consultation sync availability status. |

---

## 6. Access Control Security Guarantees

1. **Defense-in-Depth Pipeline:** Every route transition is verified at two distinct operational boundaries:
   - **Boundary 1 (Edge Middleware):** `src/middleware.ts` rejects unauthenticated requests before any page or server component rendering starts.
   - **Boundary 2 (Database Level):** Even if edge middleware was misconfigured, Supabase Row Level Security (RLS) rejects queries lacking valid tenant credentials (`auth.uid() = user_id`).
2. **Staff Privilege Invariance:** Client users cannot escalate privileges by updating `profiles.role` because the PostgreSQL trigger `guard_profile_role` aborts modifications unless executed by an authenticated `super_admin`.
3. **Fail-Closed API Handlers:** Any error during credential resolution, session deserialization, or suppression lookup aborts the request immediately with a 401 or 403 status code.
