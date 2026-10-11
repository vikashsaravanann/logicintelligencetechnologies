# Automation Security Specification & Threat Model

**Platform:** Logic Intelligence Technologies (LIT)  
**Classification:** Enterprise Confidential / Security Architecture  
**Document Reference:** `LIT-SEC-AUT-001`  
**Version:** 1.0.0  
**Effective Date:** October 2026  
**Status:** Approved & Enforced  

---

## 1. Executive Summary & Security Baseline

The Logic Intelligence Technologies (LIT) Automation Engine coordinates asynchronous workflows, customer onboarding events, contract lifecycles, and cross-platform notifications between the primary web application (`logicintelligencetechnologies`), the central n8n orchestration instance (`https://automation.logicintelligencetechnologies.in`), and satellite microservices.

Operating under a strict **Zero-Trust Architecture (ZTA)** pursuant to NIST SP 800-207, every incoming and outgoing webhook payload is treated as traversing an untrusted network. Security controls do not rely on network perimeter assumptions or IP whitelisting alone. Instead, authenticity, integrity, and non-repudiation are cryptographically guaranteed through **HMAC-SHA256 message authentication**, **bounded payload size restrictions**, **strict replay protection windows**, and **zero-credential exposure** across execution environments.

---

## 2. Threat Model

The automation engine threat model evaluates adversaries ranging from opportunistic internet scanners and malicious third-party API actors to compromised workflow nodes and insider threats.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THREAT MODEL & PERIMETER                        │
└────────────────────────────────────────────────────────────────────────┘

    [ Adversary / Scanner ] ──( 1. Spoofed Webhook Callback )───┐
                                                                 ▼
    [ Untrusted Client ]    ──( 2. Replay of Captured Event )──► [ LIT App: /api/automation/callback ]
                                                                 │  - Size Bound (<= 64KB)
    [ Eavesdropper ]        ──( 3. In-Transit Tampering )───────►│  - IP Rate Limit (60/min)
                                                                 │  - HMAC-SHA256 Verification
                                                                 │  - Replay Skew Check (<= 300s)
                                                                 │  - Strict JSON Schema Parsing
                                                                 │  - Idempotent State Transition
                                                                 ▼
                                                         [ Supabase PostgreSQL ]
                                                         - Forced Row-Level Security
                                                         - Service-Role Only on Events
                                                                 ▲
    [ Compromised Node ]    ──( 4. Secret Exfiltration )─────────┤
                                                                 │
    [ Third-Party Leak ]    ──( 5. Credential / PII Exposure )───┴ [ n8n Engine ]
                                                                   - $env Injection Only
                                                                   - Zero Service-Role Keys
```

### 2.1 Threat Vector Matrix (STRIDE Analysis)

| Threat Category | Potential Attack Vector | Impact Severity | Applied Defensive Mitigation |
|---|---|---|---|
| **Spoofing** | Attacker crafts synthetic HTTP POST to `/api/automation/callback` claiming an event succeeded or failed. | **CRITICAL** | Mandate HMAC-SHA256 signature verification (`v1=<hex>`) against `$env.N8N_WEBHOOK_SECRET` **prior** to parsing or processing payload. Generic HTTP 401 on failure with zero detail leakage. |
| **Tampering** | Man-in-the-middle modifies payload parameters (e.g., altering `eventId` or status metadata) in transit. | **HIGH** | TLS 1.3 transit encryption combined with HMAC signature covering `${timestamp}.${eventId}.${rawBody}`. Any alteration invalidates the cryptographic MAC. |
| **Repudiation** | Disputed event execution status or unauthorized administrative workflow sync. | **MEDIUM** | Immutable append-only audit trail in `admin_audit_log` with SHA-256 hashed client IP, actor user ID, correlation ID, and execution timestamps. |
| **Information Disclosure** | Leakage of API tokens, database keys, or customer PII via workflow logs, HTTP headers, or error traces. | **CRITICAL** | Automated recursive redaction of sensitive keys (`redactMetadata`), 500-character string truncation, 8KB JSON payload ceilings, and zero service-role keys in n8n nodes. |
| **Denial of Service (DoS)** | Volumetric floods or resource exhaustion via oversized payloads (e.g., zip bombs or unbounded JSON). | **HIGH** | Strict 64KB content-length and raw body ceiling (`MAX_BODY = 64 * 1024`), memory-efficient per-IP sliding rate limiting (60 req/min), and 8,000ms fetch timeouts. |
| **Elevation of Privilege** | Compromised n8n workflow node executing arbitrary queries against the database. | **CRITICAL** | n8n has **zero** direct PostgreSQL credentials or Supabase `service_role` keys. All mutations must occur via signed HTTP callbacks to validated API contracts. |

---

## 3. Cryptographic Signature Scheme (HMAC-SHA256)

Every webhook transmitted between Logic Intelligence Technologies and the n8n automation engine is cryptographically signed using Hash-based Message Authentication Codes (HMAC) backed by the SHA-256 digest algorithm.

### 3.1 Header Specification

All automation requests MUST carry the following tripartite header set:

| Header Name | Type | Format / Constraints | Description |
|---|---|---|---|
| `x-lit-signature` | String | `v1=<hex_digest>` | The canonical HMAC-SHA256 hex digest prefixed with the version identifier `v1=`. |
| `x-lit-timestamp` | String | Integer (Unix Epoch Seconds) | Timestamp indicating when the sender formulated and signed the payload. |
| `x-lit-event-id` | String | UUIDv4 (`[0-9a-f-]{36}`) | Unique event identifier assigned by the dispatching platform. |

### 3.2 Canonical Signing String Formulation

To prevent parameter tampering, collision attacks, and payload detachment, the cryptographic signature is computed over a strictly ordered, period-delimited string:

$$\text{SigningString} = \text{timestamp} \mathbin{\Vert} \text{"."} \mathbin{\Vert} \text{eventId} \mathbin{\Vert} \text{"."} \mathbin{\Vert} \text{rawBody}$$

Where:
- `timestamp`: The exact ASCII string provided in the `x-lit-timestamp` header.
- `eventId`: The exact ASCII string provided in the `x-lit-event-id` header.
- `rawBody`: The exact unparsed UTF-8 bytes / string of the HTTP request body.

```typescript
// Canonical computation implementation (TypeScript)
import { createHmac } from "crypto";

export const SIGNATURE_VERSION = "v1";

export function signV1(secret: string, timestamp: string, eventId: string, rawBody: string): string {
  const canonicalString = `${timestamp}.${eventId}.${rawBody}`;
  const mac = createHmac("sha256", secret)
    .update(canonicalString)
    .digest("hex");
  return `${SIGNATURE_VERSION}=${mac}`;
}
```

### 3.3 Timing-Safe Comparison & Side-Channel Defense

Standard string comparisons (`===` or `strcmp`) exit immediately upon encountering the first differing byte, leaking timing information that allows statistical recovery of valid signatures.

All signature verifications MUST utilize constant-time comparison via Node.js `crypto.timingSafeEqual` over fixed-length buffer representations:

```typescript
function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  // Fail immediately if lengths differ, but execute timingSafeEqual when identical
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}
```

### 3.4 Verification Order of Operations

To prevent Denial of Service and Remote Code Execution vulnerabilities, endpoints processing webhooks (e.g., `/api/automation/callback`) MUST execute checks in the following inviolable sequence:

```
[ Incoming Request ]
        │
        ├─► 1. Pre-Read Content-Length Check: declared length <= 64 KB (Reject 413)
        │
        ├─► 2. Client IP Rate Limiting: max 60 requests/minute (Reject 429)
        │
        ├─► 3. Buffer Body as Raw String: rawBody.length <= 64 KB (Reject 413)
        │
        ├─► 4. Verify HMAC-SHA256 & Timestamp Skew (verifyV1) (Reject 401)
        │      (Executes timing-safe comparison; fails closed if secret is missing)
        │
        ├─► 5. Parse JSON & Validate Zod Schema (Reject 400)
        │
        ├─► 6. Match Event ID: Header `x-lit-event-id` === `body.eventId` (Reject 400)
        │
        ├─► 7. Query Event in Database: verify existence in `automation_events` (Reject 404)
        │
        ├─► 8. Check Idempotency: if status in ['processed', 'failed'], return 200 (No-Op)
        │
        └─► 9. Atomic State Transition: update status WHERE status IN ('pending', 'dispatched')
```

---

## 4. Replay Defense & Clock Skew Windows

A valid cryptographic signature captured by an adversary could theoretically be re-transmitted to trigger unwanted state transitions. LIT enforces dual-layer replay protection:

### 4.1 300-Second Clock Skew Tolerance

The system enforces a strict 300-second (5-minute) maximum drift window between the request generation timestamp and the server's authoritative system clock:

$$|\text{nowSec} - \text{timestamp}| \le 300$$

- If $|\text{nowSec} - \text{timestamp}| > 300$, the request is immediately rejected with reason `"stale"` (HTTP 401).
- Future timestamps beyond 300 seconds (indicative of clock manipulation or malicious crafting) are equally rejected.
- NTP synchronization is enforced across all production compute hosts (Vercel Edge, Docker host, n8n instance).

### 4.2 Database State-Machine Idempotency

Timestamps defend against delayed replay, while database state locks defend against immediate replay within the 300-second window:

1. **Terminal State Immutability**: Once an event enters `processed` or `failed`, subsequent callbacks referencing that `eventId` succeed with `{ ok: true, idempotent: true }` without executing any downstream triggers or updating timestamps.
2. **Atomic Status Predicate**: Database updates enforce conditional state progression:
   ```sql
   UPDATE public.automation_events
   SET status = $1, updated_at = now()
   WHERE id = $2 AND status IN ('pending', 'dispatched');
   ```
   If zero rows are affected due to concurrent execution, the transaction safely no-ops.

---

## 5. Secret Storage & Runtime Injection Policies

Logic Intelligence Technologies operates under a **Zero Secrets in Repository** doctrine.

### 5.1 Repository Isolation Policies

1. **No Static Secrets**: API keys, HMAC secrets, database credentials, and service tokens are forbidden from git commits, pull requests, test fixtures, and documentation.
2. **Pre-Commit Enforcement**: Secret scanning (`git secrets`, Ruff scanner, Trufflehog) runs in CI/CD pipeline (`.github/workflows/ci.yml`). Any commit containing tokens matching high-entropy or provider patterns fails builds immediately.
3. **Environment Separation**: Development, staging, and production environments utilize separate cryptographic keys and isolated Supabase instances.

### 5.2 n8n Runtime Secret Injection

Workflow definitions stored in version control (`src/lib/automation/n8n/*.json`) MUST NOT contain hardcoded API tokens or callback URLs. Instead, environment variables are dynamically resolved at execution time via n8n's expression engine:

- `$env.N8N_WEBHOOK_SECRET`: Secure 256-bit entropy secret injected into the n8n Docker container at boot. Used exclusively within Code nodes for HMAC verification and callback signing.
- `$env.LIT_CALLBACK_URL`: Target URL for the completion callback (e.g., `https://logicintelligencetechnologies.in/api/automation/callback`), injected per environment.
- `$env.N8N_API_KEY`: Administrative key used by the Next.js server to deploy workflows and monitor instance health.

### 5.3 Complete Exclusion of Supabase Service-Role Keys

```
[ CRITICAL SECURITY INVARIANT ]
Under NO circumstances shall the Supabase `service_role` key, database connection 
strings, or PostgreSQL master credentials ever be:
1. Provided as an environment variable to n8n.
2. Stored in n8n credentials vault or global workflow variables.
3. Passed into n8n Webhook, HTTP Request, or Code nodes.
4. Bundled into client-side code (`NEXT_PUBLIC_*` prefixes).
```

Any database mutation required as a result of an automated workflow must be mediated by the Next.js application API via signed callback, ensuring all database interactions pass through established application validation and Row-Level Security (RLS) layers.

### 5.4 Production HTTPS Enforcement

All production HTTP communications to and from n8n MUST use TLS 1.3. The URL normalizer (`normalizeN8nBase`) programmatically fails closed in production:

```typescript
if (isProduction && url.protocol !== "https:") {
  throw new Error("n8n base URL must be https in production");
}
```

---

## 6. Audit Logging Hygiene & Data Minimization

Every administrative action, automation sync, and external callback is permanently recorded in the `admin_audit_log` table. To comply with global privacy standards, strict sanitization occurs prior to database persistence.

### 6.1 Automated Metadata Redaction (`redactMetadata`)

All metadata dictionaries pass through a recursive deep-traversal filter that inspects keys and sanitizes values before insertion:

```typescript
const SENSITIVE_KEY = /pass|secret|token|key|authorization|cookie|credential/i;
const MAX_STRING = 500;
const MAX_BYTES = 8192;
```

1. **Key Pattern Redaction**: Any JSON key matching `SENSITIVE_KEY` has its value replaced with the immutable string `"[redacted]"`.
2. **String Length Truncation**: Arbitrary string values exceeding 500 characters are truncated and suffixed with `…` to prevent memory exhaustion and log bloat.
3. **Byte Ceiling Enforcement**: Total metadata JSON is capped at 8,192 bytes (8KB). If the payload exceeds 8KB, keys are systematically pruned until within limits, and `_truncated: true` is appended.
4. **Circular Reference Protection**: A `WeakSet` tracks object references during recursive inspection, neutralizing circular reference exceptions.
5. **Call Depth Limiting**: Object nesting is capped at a depth of 6 levels; deeper structures are replaced with `"[depth]"`.

### 6.2 IP Address & PII Hygiene

1. **IP Anonymization**: Client IP addresses are never stored in raw IPv4 or IPv6 format. All IPs are hashed using SHA-256 with a daily rotating salt (`ipHash = sha256(clientIp + salt)`), preserving correlation utility while rendering the data pseudonymized.
2. **Actor Attribution**: Audit logs capture `actor_user_id`, `actor_email`, and `actor_role`. For automated callbacks originating from n8n, the actor is logged as `system:n8n-automation`.
3. **HTTP Header Stripping**: Headers such as `Authorization`, `Cookie`, `X-N8N-API-KEY`, and `x-lit-signature` are permanently excluded from audit metadata fields.

---

## 7. Incident Response & Failure Modes

| Failure Condition | HTTP Code | System Behavior | Incident Procedure |
|---|---|---|---|
| Missing HMAC Secret | 500 / 401 | Application fails closed; dispatches are blocked; incoming callbacks return 401. | Super Admin must inject `N8N_WEBHOOK_SECRET` in environment or via `platform_settings`. |
| Bad Signature | 401 | Request dropped immediately; zero response detail returned to caller. | If error rate spikes > 1%, investigate key mismatch or tampering attempts. |
| Stale Timestamp (>300s) | 401 | Request rejected. | Verify NTP sync between Vercel, n8n VM, and database host. |
| Payload > 64KB | 413 | Request severed before body buffer allocation. | Inspect dispatching client for invalid payload attachments or uncompressed blobs. |
| Rate Limit Exceeded | 429 | IP throttled for 60 seconds. | Verify if n8n batch burst requires rate-limit threshold adjustments or review malicious IP. |

---

## 8. Compliance Verification & Automated Testing

The security constraints specified in this document are verified via automated unit and integration tests:
- `tests/unit/automation/webhook-signing.test.ts`: Verifies signature generation, constant-time validation, timestamp skew rejection, and payload tampering detection.
- `tests/security/tenant-rls.sql`: Validates PostgreSQL forced Row-Level Security on `automation_events` and `admin_audit_log`.
- `tests/unit/admin/audit-sanitization.test.ts`: Asserts recursive redaction of credentials and byte-ceiling clipping.
