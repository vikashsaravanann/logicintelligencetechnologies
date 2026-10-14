/**
 * Canonical 50-Point Enterprise Deployment Checklist Data.
 *
 * Source: LIT_50_Point_Enterprise_Deployment_Checklist.pdf (Version 1.0)
 * SHA-256: 32a114705c56eaf06686d677af51c86ce6bd586b724a01cf1ab4bbb26f988404
 * Scope: 8 Phases, 50 Checkpoints.
 *
 * NOTE: This is the official enterprise engineering protocol, NOT the public
 * marketing website-readiness checklist (websiteChecklist.ts).
 */

export interface EnterpriseCheckpoint {
  number: number;
  phase: number;
  phase_title: string;
  title: string;
  engineering_requirement: string;
  acceptance_criteria: string;
  verification_evidence: string;
  pdf_page: number;
}

export interface EnterpriseChecklistPhase {
  phase: number;
  title: string;
  range: string;
  checkpoints: EnterpriseCheckpoint[];
}

export interface EnterpriseChecklistMetadata {
  document_title: string;
  document_version: string;
  source_file: string;
  source_pdf_sha256: string;
  source_pages: number;
  phase_count: number;
  checkpoint_count: number;
}

export const ENTERPRISE_CHECKLIST_METADATA: EnterpriseChecklistMetadata = {
  document_title: "The 50-Point Enterprise Deployment Checklist",
  document_version: "1.0",
  source_file: "LIT_50_Point_Enterprise_Deployment_Checklist.pdf",
  source_pdf_sha256: "32a114705c56eaf06686d677af51c86ce6bd586b724a01cf1ab4bbb26f988404",
  source_pages: 21,
  phase_count: 8,
  checkpoint_count: 50,
};

export const ENTERPRISE_CHECKPOINTS: EnterpriseCheckpoint[] = [
  {
    "number": 1,
    "phase": 1,
    "phase_title": "Architecture & Scope Validation",
    "title": "Architecture & Requirements Baseline",
    "engineering_requirement": "Produce a documented system architecture covering frontend applications, backend services, databases, authentication, external APIs, network boundaries and deployment targets, with functional and non-functional requirements (performance, availability, data sensitivity) traced to it.",
    "acceptance_criteria": "An approved architecture document exists with current diagrams, a requirements traceability matrix, named non-functional targets and an identified dependency list; scope is signed off by the technical lead.",
    "verification_evidence": "Architecture document and diagrams, the traceability matrix, and the dated scope approval in the project record.",
    "pdf_page": 4
  },
  {
    "number": 2,
    "phase": 1,
    "phase_title": "Architecture & Scope Validation",
    "title": "GitHub Repository & Branch Protection",
    "engineering_requirement": "Define the repository strategy (monorepo or multirepo), set CODEOWNERS, protect the main and release branches, and require passing status checks and pull-request review before merge; adopt a release-tagging convention.",
    "acceptance_criteria": "main cannot be pushed to directly; merges require at least one approving review and green required checks; releases are tagged; repository access follows least privilege.",
    "verification_evidence": "Branch-protection settings, CODEOWNERS file, a sample merged pull request showing enforced reviews/checks, and the repository access list.",
    "pdf_page": 4
  },
  {
    "number": 3,
    "phase": 1,
    "phase_title": "Architecture & Scope Validation",
    "title": "Environment Separation (Dev / Staging / Production)",
    "engineering_requirement": "Provision isolated development, staging and production environments with environment-scoped secrets, independent deployment targets and distinct data stores so non-production code cannot write to production records.",
    "acceptance_criteria": "Each environment has its own configuration and credentials; a staging action cannot create or modify a production row; promotion between environments is explicit and controlled.",
    "verification_evidence": "Environment configuration matrix, secret-scope settings per environment, and a test showing a staging write does not reach production data.",
    "pdf_page": 4
  },
  {
    "number": 4,
    "phase": 1,
    "phase_title": "Architecture & Scope Validation",
    "title": "Cloud Infrastructure & Account Provisioning",
    "engineering_requirement": "Verify ownership and configuration of Vercel projects, Render services, Supabase projects, DNS, required service accounts and billing limits, with an explicit mapping between environments, repositories, services and domains.",
    "acceptance_criteria": "Every environment maps to a known project, service, repository and domain under LIT-controlled accounts with billing limits set; no orphaned or personal-account resources serve production.",
    "verification_evidence": "The environment-to-service mapping table, provider project/service identifiers, DNS ownership records, and configured billing/spend limits.",
    "pdf_page": 5
  },
  {
    "number": 5,
    "phase": 1,
    "phase_title": "Architecture & Scope Validation",
    "title": "Technical Risk & Dependency Assessment",
    "engineering_requirement": "Maintain a register of external-service dependencies, operational risks, expected traffic, data sensitivity, availability requirements, expected costs and mitigations, including failure scenarios and recovery ownership.",
    "acceptance_criteria": "Each external dependency has a documented failure mode, mitigation and named owner; availability and cost expectations are recorded and agreed.",
    "verification_evidence": "The risk and dependency register with owners, mitigations and recovery responsibilities. 2 P H A S E 2",
    "pdf_page": 5
  },
  {
    "number": 6,
    "phase": 2,
    "phase_title": "Frontend Engineering & UX",
    "title": "Next.js & React Production Architecture",
    "engineering_requirement": "Validate the rendering strategy (server vs client boundaries), route structure, error boundaries, caching and metadata configuration, and confirm a clean production build. Where Next.js 16 is adopted, use its supported application architecture and build requirements.",
    "acceptance_criteria": "A production build completes without errors or disallowed warnings; server/client boundaries are deliberate; error boundaries and metadata are present on key routes.",
    "verification_evidence": "The production build log, the route/rendering map, and a review of error-boundary and metadata configuration.",
    "pdf_page": 5
  },
  {
    "number": 7,
    "phase": 2,
    "phase_title": "Frontend Engineering & UX",
    "title": "TypeScript & Component Architecture",
    "engineering_requirement": "Enforce strict TypeScript, reusable typed components, explicit interface contracts, predictable state management and validation of external data at boundaries; avoid unsafe any and unvalidated inputs.",
    "acceptance_criteria": "The type-check passes in strict mode with no new errors; shared components have typed props; external responses are validated before use.",
    "verification_evidence": "The strict type-check (tsc) output in CI, and a code review of component interfaces and boundary validation.",
    "pdf_page": 6
  },
  {
    "number": 8,
    "phase": 2,
    "phase_title": "Frontend Engineering & UX",
    "title": "Tailwind Design Tokens & Brand Consistency",
    "engineering_requirement": "Define a central design system — typography, spacing, colour, components, responsive breakpoints, visual states and accessible contrast — as reusable tokens rather than values duplicated across pages.",
    "acceptance_criteria": "Colour, type and spacing come from shared tokens; components reuse them; text/background pairs meet contrast targets; no ad-hoc hard-coded style values on key screens.",
    "verification_evidence": "The design-token/config source, and a review showing components consuming tokens plus contrast-check results.",
    "pdf_page": 6
  },
  {
    "number": 9,
    "phase": 2,
    "phase_title": "Frontend Engineering & UX",
    "title": "Responsive & Cross-Browser Compatibility",
    "engineering_requirement": "Test navigation, forms, tables, dialogs, animations and interactive elements at representative desktop, tablet and mobile viewports across the supported browser set.",
    "acceptance_criteria": "Key journeys render and function correctly at each defined breakpoint on each supported browser, with no broken layout, overflow or inoperable control.",
    "verification_evidence": "A device/browser test matrix with pass/fail per journey and screenshots of the key breakpoints.",
    "pdf_page": 6
  },
  {
    "number": 10,
    "phase": 2,
    "phase_title": "Frontend Engineering & UX",
    "title": "Core Web Vitals & Frontend Performance",
    "engineering_requirement": "Measure Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift against documented thresholds, and verify image optimization, JavaScript bundle budgets, caching and route-loading behaviour.",
    "acceptance_criteria": "Key pages meet the project’s stated LCP, INP and CLS thresholds in real-browser measurement; bundle sizes are within budget; images are optimized.",
    "verification_evidence": "Lab and/or field Web Vitals reports for key routes, and the bundle-analysis output against the defined budget.",
    "pdf_page": 7
  },
  {
    "number": 11,
    "phase": 2,
    "phase_title": "Frontend Engineering & UX",
    "title": "Accessibility & Inclusive Interaction",
    "engineering_requirement": "Apply WCAG 2.2 AA-oriented checks: keyboard navigation, screen-reader names, form-error association, focus management, contrast, reduced-motion support and responsive text scaling, combining automated and manual testing.",
    "acceptance_criteria": "Important journeys are fully operable by keyboard and screen reader; automated checks report no critical violations; focus order and error messaging are correct.",
    "verification_evidence": "Automated accessibility scan results plus a manual audit record for the primary journeys.",
    "pdf_page": 7
  },
  {
    "number": 12,
    "phase": 2,
    "phase_title": "Frontend Engineering & UX",
    "title": "Forms, API Wiring & User Feedback",
    "engineering_requirement": "Every production form validates inputs, submits to an authorized backend, persists where required, guards against duplicate submission and shows truthful success or failure states reflecting the real result.",
    "acceptance_criteria": "Submitting a form creates the expected backend record and routes to its operational destination; failures are shown as failures; a success message is never displayed without persistence.",
    "verification_evidence": "A staging submission trace from form to stored record/notification, and a test confirming failure states on a forced backend error.",
    "pdf_page": 7
  },
  {
    "number": 13,
    "phase": 3,
    "phase_title": "Backend & Database Integrity",
    "title": "FastAPI Service Architecture & API Contracts",
    "engineering_requirement": "Verify FastAPI routing, request/response schemas, status codes, authentication dependencies, exception handling and generated OpenAPI documentation, with contracts agreed between frontend and backend.",
    "acceptance_criteria": "Endpoints validate against declared schemas, return correct status codes, enforce auth dependencies and return structured errors; the OpenAPI spec matches the implemented contract.",
    "verification_evidence": "The OpenAPI document, schema/validation tests, and a review of auth dependencies and error handlers.",
    "pdf_page": 8
  },
  {
    "number": 14,
    "phase": 3,
    "phase_title": "Backend & Database Integrity",
    "title": "PostgreSQL Schema Design & Referential Integrity",
    "engineering_requirement": "Model data with correctly typed identifiers, primary and foreign keys, constraints and indexes, normalized where appropriate, and manage changes through versioned migrations.",
    "acceptance_criteria": "The deployed schema matches migrations; foreign-key and uniqueness constraints are enforced; lookup columns are indexed; no orphaned references exist in test data.",
    "verification_evidence": "Migration history, a schema diff against the database, and constraint/integrity test results.",
    "pdf_page": 8
  },
  {
    "number": 15,
    "phase": 3,
    "phase_title": "Backend & Database Integrity",
    "title": "Supabase Row-Level Security & Tenant Isolation",
    "engineering_requirement": "Define explicit Row-Level Security policies for every table exposed through Supabase APIs, enforcing least privilege and tenant separation, and keep the service-role key server-side only.",
    "acceptance_criteria": "A user from one tenant cannot read or write another tenant’s rows via the API; privileged functions are protected; the service-role key never reaches the browser.",
    "verification_evidence": "The RLS policy definitions, a cross-tenant access test (expected denials), and confirmation the service-role key is absent from client bundles.",
    "pdf_page": 8
  },
  {
    "number": 16,
    "phase": 3,
    "phase_title": "Backend & Database Integrity",
    "title": "Connection Pooling & Resource Management",
    "engineering_requirement": "Configure connection pooling, connection lifecycle, transaction timeouts, retry behaviour and connection limits appropriate to the serverless/container hosting model.",
    "acceptance_criteria": "Under expected concurrency the service stays within connection limits without exhaustion; timeouts and retries behave as configured.",
    "verification_evidence": "Pooler configuration, and a concurrency test report showing connection counts and error rates within limits.",
    "pdf_page": 9
  },
  {
    "number": 17,
    "phase": 3,
    "phase_title": "Backend & Database Integrity",
    "title": "Idempotent Operations & Duplicate Prevention",
    "engineering_requirement": "Apply idempotency keys, unique constraints and transactional processing so retries of critical submissions, payment events, provisioning actions and background jobs do not create duplicates.",
    "acceptance_criteria": "Replaying the same request or event produces exactly one effect; concurrent duplicates are rejected or de-duplicated.",
    "verification_evidence": "An idempotency test (duplicate/retried requests), and the unique-constraint definitions on the affected tables.",
    "pdf_page": 9
  },
  {
    "number": 18,
    "phase": 3,
    "phase_title": "Backend & Database Integrity",
    "title": "Transaction Integrity, Backup & Recovery",
    "engineering_requirement": "Verify ACID transaction boundaries, scheduled backups, a tested restoration procedure and migration-rollback planning; a successful backup is not treated as proof of recoverability.",
    "acceptance_criteria": "A backup can be restored into a usable environment and verified; transaction boundaries prevent partial writes; a migration can be rolled back.",
    "verification_evidence": "A dated restore-test record showing data verified after restore, plus the backup schedule and rollback plan.",
    "pdf_page": 9
  },
  {
    "number": 19,
    "phase": 3,
    "phase_title": "Backend & Database Integrity",
    "title": "Server-Side Validation & Auditability",
    "engineering_requirement": "Validate all API inputs on the server, generate authoritative identifiers server-side, and emit durable audit events for privileged operations; never rely on frontend-only persistence or success.",
    "acceptance_criteria": "Invalid inputs are rejected server-side; identifiers are server-generated; privileged actions produce audit records with actor, action and timestamp.",
    "verification_evidence": "Validation test cases, and sample audit-log entries for privileged operations. 4 P H A S E 4",
    "pdf_page": 10
  },
  {
    "number": 20,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "AI Provider Selection & Credential Management",
    "engineering_requirement": "Document the chosen model provider(s) — for example an approved Meta model API service or Google Vertex AI — and verify credentials, model availability, quotas, regional requirements and failure handling.",
    "acceptance_criteria": "The provider and model are recorded with region and quota; credentials are stored securely; the system degrades gracefully when the provider errors or is rate-limited.",
    "verification_evidence": "The provider/model configuration record, secret-store references, and a test of provider-failure handling.",
    "pdf_page": 10
  },
  {
    "number": 21,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "Knowledge Ingestion & Data Provenance",
    "engineering_requirement": "Ingest only authorized documents, with validation, source metadata, content checksums, duplicate detection, update handling and deletion procedures; do not fabricate or pad the corpus.",
    "acceptance_criteria": "Every ingested item has a verifiable source and checksum; duplicates are detected; updates and deletions propagate to the index.",
    "verification_evidence": "The ingestion log with sources and checksums, and a deletion/update test showing the index reflects the change.",
    "pdf_page": 10
  },
  {
    "number": 22,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "pgvector Semantic Search & Index Validation",
    "engineering_requirement": "Where semantic retrieval is used, validate embedding generation, vector dimensions, the pgvector schema, the chosen vector index and both search accuracy and query performance.",
    "acceptance_criteria": "Embedding dimensions match the index; retrieval returns relevant results on a labelled set above the project’s relevance threshold; query latency is within target.",
    "verification_evidence": "A retrieval benchmark with relevance scores and latency, and the pgvector schema/index definition.",
    "pdf_page": 11
  },
  {
    "number": 23,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "Retrieval-Augmented Generation Architecture",
    "engineering_requirement": "Implement document chunking, retrieval ranking, permission filtering, source attribution, context assembly and citation integrity so the assistant cannot surface content a user is not authorized to see.",
    "acceptance_criteria": "Answers cite retrieved sources accurately; permission filters exclude unauthorized documents from context; citations resolve to real passages.",
    "verification_evidence": "A permission-filtering test (authorized vs unauthorized user on the same query), and a citation-integrity review.",
    "pdf_page": 11
  },
  {
    "number": 24,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "Prompt Injection & Tool-Use Protection",
    "engineering_requirement": "Separate trusted instructions from retrieved content, test for prompt injection, enforce tool permissions and require confirmation gates for consequential actions; untrusted documents must not override authorization.",
    "acceptance_criteria": "Injection attempts embedded in documents do not change system behaviour or trigger unauthorized tool use; consequential actions require explicit confirmation.",
    "verification_evidence": "A prompt-injection test suite with results, and the tool-permission and confirmation-gate configuration.",
    "pdf_page": 11
  },
  {
    "number": 25,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "AI Response Quality & Factual Verification",
    "engineering_requirement": "Maintain evaluation datasets covering factual accuracy, completeness, consistency, citation quality and hallucination resistance; time-sensitive facts must come from appropriately fresh, verifiable sources.",
    "acceptance_criteria": "The model meets the project’s stated quality thresholds on the evaluation set; unsupported claims and stale facts are caught by the evaluation.",
    "verification_evidence": "The evaluation dataset and scored results, including hallucination and citation-quality metrics.",
    "pdf_page": 12
  },
  {
    "number": 26,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "AI Latency, Streaming & Resource Optimization",
    "engineering_requirement": "Measure time to first token, completion time, retrieval latency, model execution time and error rates; apply streaming, bounded context windows, caching and resource controls, and define per-application SLOs.",
    "acceptance_criteria": "Measured latencies meet the application-specific SLOs; streaming is used where appropriate; context size and cost stay within bounds.",
    "verification_evidence": "A latency/throughput report against the defined SLOs, and the streaming/context/caching configuration.",
    "pdf_page": 12
  },
  {
    "number": 27,
    "phase": 4,
    "phase_title": "AI & Data Pipeline Integration",
    "title": "AI Privacy, Memory & Retention Controls",
    "engineering_requirement": "Control storage of conversation history with consent where appropriate, per-user isolation, retention policies and deletion; where zero-retention is required, verify both application behaviour and the provider’s contractual and technical retention settings.",
    "acceptance_criteria": "Conversation data is isolated per user and retained/deleted per policy; a deletion request removes the data; any zero-retention claim is backed by the provider’s configured settings.",
    "verification_evidence": "The retention policy, a user-data deletion test, and the provider’s documented retention/opt-out configuration.",
    "pdf_page": 12
  },
  {
    "number": 28,
    "phase": 5,
    "phase_title": "Telephony & Real-Time WebSockets (If Applicable)",
    "title": "Audio Capture, Sampling & Encoding Validation",
    "engineering_requirement": "For speech pipelines, verify microphone capture, sampling-rate conversion (for example 16 kHz mono PCM where the selected STT provider requires it), frame sizes, encoding and handling of invalid audio; do not force 16 kHz when the provider contract specifies another format.",
    "acceptance_criteria": "Audio reaches the STT provider in its required format; malformed audio is handled without crashing; the sampling rate matches the provider contract.",
    "verification_evidence": "The audio-pipeline configuration, and a test log showing accepted formats and graceful handling of invalid input.",
    "pdf_page": 13
  },
  {
    "number": 29,
    "phase": 5,
    "phase_title": "Telephony & Real-Time WebSockets (If Applicable)",
    "title": "Non-Blocking Real-Time Audio Pipeline",
    "engineering_requirement": "Ensure non-blocking I/O, bounded asyncio.Queue (or equivalent) handling, backpressure management, defined queue-overflow behaviour and no blocking work inside latency-sensitive event loops.",
    "acceptance_criteria": "Under sustained audio the event loop is not blocked; queues stay bounded with defined overflow behaviour; no dropped-frame cascade occurs.",
    "verification_evidence": "A load test of the audio path showing queue depth and loop latency, and a review confirming no blocking calls in hot paths.",
    "pdf_page": 13
  },
  {
    "number": 30,
    "phase": 5,
    "phase_title": "Telephony & Real-Time WebSockets (If Applicable)",
    "title": "WebSocket Session Lifecycle & Reliability",
    "engineering_requirement": "Require authenticated session establishment, connection-health/heartbeat handling, reconnect behaviour, message sequencing, cleanup and correct behaviour when connectivity is interrupted.",
    "acceptance_criteria": "Sessions authenticate before use; dropped connections reconnect and resume or fail cleanly; no leaked sessions remain after disconnect.",
    "verification_evidence": "A connection-interruption test showing reconnect/cleanup, and the heartbeat/sequencing configuration.",
    "pdf_page": 13
  },
  {
    "number": 31,
    "phase": 5,
    "phase_title": "Telephony & Real-Time WebSockets (If Applicable)",
    "title": "STT → LLM → TTS Orchestration",
    "engineering_requirement": "Validate streaming transcription, AI processing, speech generation, interruptibility, cancellation, conversation state and recovery from provider errors, measuring each stage independently.",
    "acceptance_criteria": "A caller can interrupt and the pipeline cancels in-flight work; each stage recovers from a provider error; conversation state stays consistent.",
    "verification_evidence": "Per-stage latency and error measurements, and an interruption/cancellation test record.",
    "pdf_page": 14
  },
  {
    "number": 32,
    "phase": 5,
    "phase_title": "Telephony & Real-Time WebSockets (If Applicable)",
    "title": "End-to-End Voice Latency & Quality",
    "engineering_requirement": "Define and test response latency, transcription accuracy, speech quality, interruptions and jitter under realistic conditions; a sub-400 ms turnaround may be investigated for suitable streaming components where feasible, but must not be claimed end-to-end unless defined, measured and achieved under documented conditions.",
    "acceptance_criteria": "Measured latency and quality meet the project’s documented targets under realistic load; any sub-400 ms claim is scoped to the measured component and conditions.",
    "verification_evidence": "The end-to-end voice test report with latency distribution, accuracy and the conditions under which it was measured. 6 P H A S E 6",
    "pdf_page": 14
  },
  {
    "number": 33,
    "phase": 6,
    "phase_title": "Security & Compliance",
    "title": "Authentication, Authorization & MFA",
    "engineering_requirement": "Verify secure login, account lifecycle, role-based permissions, MFA where appropriate, session expiry, access revocation and enforcement of authorization at backend boundaries (not only in the UI).",
    "acceptance_criteria": "Access decisions are enforced server-side per role; sessions expire and can be revoked; MFA is available where required; revoked access takes effect immediately.",
    "verification_evidence": "Authorization test cases per role, session-expiry/revocation tests, and the MFA configuration.",
    "pdf_page": 14
  },
  {
    "number": 34,
    "phase": 6,
    "phase_title": "Security & Compliance",
    "title": "API Rate Limiting & Abuse Protection",
    "engineering_requirement": "Implement and test rate limits, request-size limits, bot mitigation, brute-force protection and safe throttling of expensive AI endpoints.",
    "acceptance_criteria": "Abusive request volumes are throttled with correct status codes; oversized requests are rejected; expensive endpoints have stricter limits.",
    "verification_evidence": "Rate-limit configuration and a test showing throttling behaviour and response codes under burst load.",
    "pdf_page": 15
  },
  {
    "number": 35,
    "phase": 6,
    "phase_title": "Security & Compliance",
    "title": "Secrets Management & Credential Rotation",
    "engineering_requirement": "Hold credentials only in approved secret stores or deployment environments, enable repository secret scanning, minimize access, define rotation procedures and prevent secret leakage through build artifacts and logs.",
    "acceptance_criteria": "No secrets exist in the repository or build output; secret scanning is active; a documented rotation procedure exists and access is least-privilege.",
    "verification_evidence": "Secret-scanning results, the secret-store configuration, and the rotation procedure.",
    "pdf_page": 15
  },
  {
    "number": 36,
    "phase": 6,
    "phase_title": "Security & Compliance",
    "title": "TLS, DNS, Security Headers & Transport Protection",
    "engineering_requirement": "Verify HTTPS with valid certificates, appropriate TLS configuration, secure cookies, HSTS where appropriate, a content security policy and essential browser security headers.",
    "acceptance_criteria": "All traffic is HTTPS with valid certificates; security headers are present and correct; cookies are secure and scoped.",
    "verification_evidence": "An external TLS/headers scan of the production domain, and the header/cookie configuration.",
    "pdf_page": 15
  },
  {
    "number": 37,
    "phase": 6,
    "phase_title": "Security & Compliance",
    "title": "Sensitive Data Protection & Encryption",
    "engineering_requirement": "Require encryption in transit, encryption at rest where needed, access-controlled object storage, data minimization and retention enforcement, and document which components process sensitive data.",
    "acceptance_criteria": "Sensitive data is encrypted in transit and at rest where required; storage access is controlled; retention is enforced; the data-flow for sensitive payloads is documented.",
    "verification_evidence": "The data-flow/classification document, storage access-control settings, and encryption configuration evidence.",
    "pdf_page": 15
  },
  {
    "number": 38,
    "phase": 6,
    "phase_title": "Security & Compliance",
    "title": "Vulnerability & Compliance Review",
    "engineering_requirement": "Run dependency vulnerability scanning and application security testing, cover authentication/authorization test cases, perform a privacy-impact review where appropriate, assign incident-response responsibilities and document remediation; reference regulatory frameworks only when genuinely applicable.",
    "acceptance_criteria": "Known critical/high vulnerabilities are remediated or formally accepted; security test cases pass; incident responsibilities are assigned; no unfounded compliance claims are made.",
    "verification_evidence": "The dependency-scan and security-test reports with remediation status, and the incident-response ownership record. 7 P H A S E 7",
    "pdf_page": 16
  },
  {
    "number": 39,
    "phase": 7,
    "phase_title": "QA, Testing & Telemetry",
    "title": "Automated Unit & Integration Testing",
    "engineering_requirement": "Maintain unit tests, tests with mocked external dependencies, backend integration tests, database tests and frontend component tests, with project-appropriate coverage and critical-path acceptance thresholds.",
    "acceptance_criteria": "The test suite passes in CI; coverage meets the agreed threshold; critical paths have explicit tests.",
    "verification_evidence": "The CI test run and coverage report against the defined threshold.",
    "pdf_page": 16
  },
  {
    "number": 40,
    "phase": 7,
    "phase_title": "QA, Testing & Telemetry",
    "title": "End-to-End User Journey Verification",
    "engineering_requirement": "Test authentication, forms, account activation, dashboard access, API interactions, notifications and any payment or AI workflows against staging, asserting real outcomes rather than only HTTP 200.",
    "acceptance_criteria": "Each critical journey completes end to end on staging with the expected data and side effects, not merely a successful response code.",
    "verification_evidence": "End-to-end test results per journey, including the resulting records/notifications verified.",
    "pdf_page": 16
  },
  {
    "number": 41,
    "phase": 7,
    "phase_title": "QA, Testing & Telemetry",
    "title": "Error Boundaries & Failure Recovery",
    "engineering_requirement": "Verify frontend error boundaries, backend exception handling, retry limits, fallback states, circuit breakers and recovery when a provider is unavailable; never show simulated success when a critical dependency fails.",
    "acceptance_criteria": "When a dependency fails, the system shows an honest failure or degraded state and recovers when the dependency returns; retries are bounded.",
    "verification_evidence": "A fault-injection test record showing behaviour with a forced dependency outage and recovery.",
    "pdf_page": 17
  },
  {
    "number": 42,
    "phase": 7,
    "phase_title": "QA, Testing & Telemetry",
    "title": "Observability, Logging & Error Monitoring",
    "engineering_requirement": "Implement structured logs with correlation IDs, actionable error monitoring (for example Sentry where selected), tracing where supported and incident alerts, while keeping secrets and unnecessary personal data out of logs.",
    "acceptance_criteria": "Errors surface in monitoring with enough context to act; logs are structured and correlated; no secrets or unnecessary PII appear in logs.",
    "verification_evidence": "Sample structured log entries with correlation IDs, the monitoring/alert configuration, and a log-redaction check.",
    "pdf_page": 17
  },
  {
    "number": 43,
    "phase": 7,
    "phase_title": "QA, Testing & Telemetry",
    "title": "Performance, Load & Scalability Testing",
    "engineering_requirement": "Run representative performance, load, stress and concurrency tests, defining throughput, latency, resource utilization and acceptable error thresholds for realistic usage.",
    "acceptance_criteria": "The system meets its throughput/latency targets at expected load and degrades predictably beyond it, within the defined error threshold.",
    "verification_evidence": "The load-test report showing throughput, latency percentiles, resource use and error rates against targets.",
    "pdf_page": 17
  },
  {
    "number": 44,
    "phase": 7,
    "phase_title": "QA, Testing & Telemetry",
    "title": "Security Regression & Production-Readiness Testing",
    "engineering_requirement": "Maintain regression tests for access control, database policies, API abuse prevention and sensitive-data exposure, and record known limitations; block release for unresolved critical issues.",
    "acceptance_criteria": "Security regression tests pass; previously fixed issues do not recur; no unresolved critical issue remains open at release.",
    "verification_evidence": "The security regression results and the open-issues list with severity and release-blocker status. 8 P H A S E 8",
    "pdf_page": 18
  },
  {
    "number": 45,
    "phase": 8,
    "phase_title": "DevOps, CI/CD & Handoff",
    "title": "GitHub Actions CI/CD Pipeline Validation",
    "engineering_requirement": "Require linting, type checking, automated tests, security checks and build verification in CI, gating deployment so changes reach the production branch only after the pipeline passes.",
    "acceptance_criteria": "A failing check blocks merge/deploy; the production branch only advances through a green pipeline; the workflow is protected from unauthorized edits.",
    "verification_evidence": "The CI workflow definition and a run history showing gating on lint, types, tests, security and build.",
    "pdf_page": 18
  },
  {
    "number": 46,
    "phase": 8,
    "phase_title": "DevOps, CI/CD & Handoff",
    "title": "Vercel Frontend Production Deployment",
    "engineering_requirement": "Verify project ownership, Git mapping, build settings, environment variables, the deployed commit, the production domain and post-deployment smoke tests; where Vercel is not the host, document the equivalent checks for the approved provider.",
    "acceptance_criteria": "The production frontend serves the intended commit on the correct domain with correct environment configuration; smoke tests pass after deploy.",
    "verification_evidence": "The deployment record (project, commit, domain), the environment-variable inventory, and smoke-test results.",
    "pdf_page": 18
  },
  {
    "number": 47,
    "phase": 8,
    "phase_title": "DevOps, CI/CD & Handoff",
    "title": "Render Backend Production Deployment",
    "engineering_requirement": "Verify service configuration, start commands, environment configuration, database connectivity, any background workers, health checks, resource allocation and the running revision; where Render is not selected, perform the equivalent backend-hosting checks.",
    "acceptance_criteria": "The backend runs the intended revision, connects to the database, passes health checks and has required workers running within allocated resources.",
    "verification_evidence": "The service configuration, health-check status, running-revision identifier and a database-connectivity check.",
    "pdf_page": 19
  },
  {
    "number": 48,
    "phase": 8,
    "phase_title": "DevOps, CI/CD & Handoff",
    "title": "DNS, Domains, CDN & Search Visibility",
    "engineering_requirement": "Verify DNS records, domain ownership, TLS certificates, redirects, canonical URLs, sitemap accessibility, robots directives and CDN behaviour, and submit to search engines where applicable, without promising indexing time or ranking.",
    "acceptance_criteria": "The production domain resolves over valid TLS with correct redirects and canonicals; the sitemap and robots rules are correct; CDN caching behaves as intended.",
    "verification_evidence": "DNS/TLS verification output, the canonical/redirect map, and the sitemap/robots configuration.",
    "pdf_page": 19
  },
  {
    "number": 49,
    "phase": 8,
    "phase_title": "DevOps, CI/CD & Handoff",
    "title": "Rollback & Operational Monitoring",
    "engineering_requirement": "Maintain documented release identifiers, a tested rollback procedure, monitoring dashboards, alert routing and post-release observation, including migration-recovery considerations; test representative recovery rather than only documenting it.",
    "acceptance_criteria": "A release can be rolled back to a known-good revision in a test; dashboards and alerts are live; post-release monitoring is defined.",
    "verification_evidence": "A rollback-test record, the monitoring dashboard and alert-routing configuration, and release-identifier history.",
    "pdf_page": 19
  },
  {
    "number": 50,
    "phase": 8,
    "phase_title": "DevOps, CI/CD & Handoff",
    "title": "IP, Documentation & Client Handover",
    "engineering_requirement": "Produce a handover inventory covering source repositories, technical documentation, API specifications, deployment architecture, approved access transfer, support responsibilities and intellectual-property terms, without disclosing passwords or private keys; define ownership and transfer per the actual contract.",
    "acceptance_criteria": "The client receives a complete, accurate handover package; access is transferred through approved channels; IP and support terms match the signed contract; no secrets appear in the handover document.",
    "verification_evidence": "The signed-off handover inventory, the access-transfer record, and the contract clause defining IP ownership and support.",
    "pdf_page": 20
  }
];

export const ENTERPRISE_PHASES: EnterpriseChecklistPhase[] = [
  {
    phase: 1,
    title: "Architecture & Scope Validation",
    range: "01–05",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 1),
  },
  {
    phase: 2,
    title: "Frontend Engineering & UX",
    range: "06–12",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 2),
  },
  {
    phase: 3,
    title: "Backend & Database Integrity",
    range: "13–19",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 3),
  },
  {
    phase: 4,
    title: "AI & Data Pipeline Integration",
    range: "20–27",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 4),
  },
  {
    phase: 5,
    title: "Telephony & Real-Time WebSockets (If Applicable)",
    range: "28–32",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 5),
  },
  {
    phase: 6,
    title: "Security & Compliance",
    range: "33–38",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 6),
  },
  {
    phase: 7,
    title: "QA, Testing & Telemetry",
    range: "39–44",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 7),
  },
  {
    phase: 8,
    title: "DevOps, CI/CD & Handoff",
    range: "45–50",
    checkpoints: ENTERPRISE_CHECKPOINTS.filter((c) => c.phase === 8),
  },
];

export const ENTERPRISE_CHECKLIST_PHASES = ENTERPRISE_PHASES;
