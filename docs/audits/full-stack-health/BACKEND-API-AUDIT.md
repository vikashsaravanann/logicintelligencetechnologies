# Backend & API Architecture Audit Report

**Runtime:** Node.js 22 LTS / Next.js Serverless Route Handlers  
**Audit Date:** October 10, 2026  
**Directory Analyzed:** `src/app/api/` (36+ endpoints)

---

## 1. Route Handlers Inventory & Security Profile

All API endpoints were audited against request bounding, body parsing, auth guards, rate limiting, and database failure behavior.

| Endpoint | Method | Auth Required | Rate Limited | Body Parsing / Schema | Fail-Closed DB | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/contact` | POST | Anonymous | Yes (IP-based) | Zod strict validation | Yes (503 if down) | VERIFIED WORKING |
| `/api/free-demo` | POST | Anonymous | Yes (IP-based) | Zod strict validation | Yes (503 if down) | VERIFIED WORKING |
| `/api/booking` | POST | Anonymous | Yes (IP-based) | Zod strict validation | Yes (503 if down) | VERIFIED WORKING |
| `/api/checklist` | POST | Anonymous | Yes (IP-based) | Zod strict validation | Yes (503 if down) | VERIFIED WORKING |
| `/api/jobs/apply` | POST | Anonymous | Yes (IP-based) | Zod strict validation | Yes (503 if down) | VERIFIED WORKING |
| `/api/newsletter` | POST | Anonymous | Yes (IP-based) | Zod strict validation | Yes (503 if down) | VERIFIED WORKING |
| `/api/newsletter/confirm` | GET | Token | Yes | HMAC Token verify | Yes | VERIFIED WORKING |
| `/api/support` | POST | Optional | Yes (IP-based) | Zod strict validation | Yes (503 if down) | VERIFIED WORKING |
| `/api/chat` | POST | Guarded | Yes (IP/User) | Zod bounded JSON | Yes (Local fallback) | VERIFIED WORKING |
| `/api/ai` | POST | Guarded | Yes (IP/User) | Bounded max 64KB | Yes (Local fallback) | VERIFIED WORKING |
| `/api/ai/abort` | POST | Session | Yes | Session check | N/A | VERIFIED WORKING |
| `/api/ai/lead` | POST | Session | Yes | Guarded lead ingest | Yes | VERIFIED WORKING |
| `/api/ai/ticket` | POST | Session | Yes | Guarded ticket | Yes | VERIFIED WORKING |
| `/api/serverless-ai` | POST | Guarded | Yes | Bounded JSON | Yes | VERIFIED WORKING |
| `/api/health` | GET | Public | No | Health check probes | Safe read-only | VERIFIED WORKING |
| `/api/health/database`| GET | Staff/Internal | No | Ping query | Safe read-only | VERIFIED WORKING |
| `/api/health/email` | GET | Staff/Internal | No | SMTP handshake probe | Safe read-only | VERIFIED WORKING |
| `/api/health/storage`| GET | Staff/Internal | No | GCS/Supabase probe | Safe read-only | VERIFIED WORKING |
| `/api/resources/[slug]/request-access` | POST | Guarded | Yes | Zod + HMAC token issue | Yes | VERIFIED WORKING |
| `/api/resources/[slug]/download` | GET | HMAC Token | Yes | Timing-safe HMAC check | Safe file stream | VERIFIED WORKING |
| `/api/admin/invoices` | GET/POST | Staff Role | Yes | Server-side role check | Yes | VERIFIED WORKING |
| `/api/admin/outreach/*`| GET/POST | Staff Role | Yes | Server-side role check | Yes | VERIFIED WORKING |
| `/api/admin/smtp-verify`| POST | Staff Role | Yes | SMTP test verification | Safe | VERIFIED WORKING |
| `/api/cron/*` | POST/GET | CRON_SECRET | No | Bearer token auth | Atomic updates | VERIFIED WORKING |

---

## 2. Issues Diagnosed & Repaired

1. **AI Route Prefer-Const ESLint Error:**
   - File: `src/app/api/ai/route.ts:72`
   - Fixed `let steps = 1` to `const steps = 1`.
2. **Turbopack NFT Tracing & Filesystem Isolation:**
   - Files: `src/lib/resources/access-token.ts`, `src/lib/resources/pdf-resolver.ts`, `src/app/api/resources/[slug]/download/route.ts`
   - Issue: `access-token.ts` imported `fs` and `path`, causing request routes to trace filesystem operations and trigger project-wide NFT warnings.
   - Fix: Extracted `resolveResourcePdfPath` into dedicated `src/lib/resources/pdf-resolver.ts` with sanitized `path.basename` and scoped paths. Kept `access-token.ts` pure cryptographic computation.
3. **Refuse Fake Success Guarantee:**
   - Verified that all public form handlers (`/api/contact`, `/api/free-demo`, `/api/checklist`, `/api/jobs/apply`, `/api/newsletter`, `/api/booking`, `/api/support`) enforce `requireDatabase()`. If Supabase is unreachable or unconfigured, they return HTTP 503 rather than sending false 200 responses to clients.
