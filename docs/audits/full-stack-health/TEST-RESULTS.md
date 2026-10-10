# Automated QA & Test Execution Results

**Environment:** Node.js 22 LTS / macOS Darwin (Local) + Ubuntu-Latest (CI Spec)  
**Execution Date:** October 10, 2026  
**Auditor:** Automated QA and Browser Testing Engineer

---

## 1. Test Suite Summary Table

| Test Suite / Script | Command | Tests Run | Pass | Fail | Exit Code | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ESLint** | `npm run lint` | Codebase files | All Pass | 0 Errors (193 warnings) | 0 | 11.2s |
| **TypeScript** | `npm run typecheck` | Entire project | Clean | 0 | 0 | 2.1s |
| **Unit Tests** | `npm run test:unit` | 260 tests / 19 suites | 260 | 0 | 0 | 2.5s |
| **Integration Tests** | `npm run test:integration` | 14 route tests | 14 | 0 | 0 | 0.13s |
| **Security Tests** | `npm run test:security` | 22 assertions | 22 | 0 | 0 | 1.49s |
| **Route Links Verification**| `npm run verify:links` | 44 static routes | 44 | 0 | 0 | 0.8s |
| **PDF Asset Verification** | `npm run verify:pdfs` | 17 corporate PDFs | 17 | 0 | 0 | 0.2s |
| **Visual Assets Audit** | `npm run audit:visuals` | All img/asset paths | 100% | 0 | 0 | 0.3s |
| **RAG Golden Set Eval** | `npm run eval:rag` | 22 golden queries | 22 (100%) | 0 | 0 | 0.4s |
| **Production Build** | `npm run build` | 107 static/SSG routes | 107 | 0 | 0 | 11.5s |
| **Live Smoke Tests** | `npm run smoke:test` | 23 live endpoints | 23 | 0 | 0 | 18.0s |

*\*Note on Smoke Test PDF Verification: Verified that `/resources/*.pdf` 404 is an intended security feature enforced by middleware for gated PDFs (which require single-use token access), while public corporate assets like `/docs/jobs-leadership.pdf` return HTTP 200.*

---

## 2. Detailed Suite Breakdown

### Unit & Security Test Suites (`npm run test`)
- `tests/email/`: Validates email templates, header escaping, Zoho transporter config, attachments, double-optin, suppression lists, retry policies.
- `tests/navigation/`: Validates route maps, header navigation, client/admin route separation, 404 handlers.
- `tests/security/`: Validates body parser chunk bounding, oversized payload rejection, rate limiting fail-closed logic, admin role guards, secret scanning.
- `tests/admin/`: Validates command center RBAC, proposal token generators, document transitions.

### Verification Scripts
- `scripts/verify-links.mjs`: Crawled all 44 primary registered routes and confirmed file existence and mapping.
- `scripts/verify-pdfs.mjs`: Verified 17 official PDFs in `private/resources/` and `public/` matching the `%PDF-1.4` magic byte header.
- `scripts/eval-rag-golden.mjs`: Tested retrieval across pricing, refund policies, packages, contact details, and custom software queries.
