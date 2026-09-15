# Last 50 Commits — Failure Analysis

**Repo:** `vikashsaravanann/logicintelligencetechnologies`  
**Production:** https://www.logicintelligencetechnologies.in/  
**Analysis date:** 2026-09-16  
**Current HEAD:** `a65979f5` — `fix(email): NewsletterConfirmationEmail accepts email + unsubscribeUrl`

## Executive summary

Failures are **not** 50 independent bugs. They are a **single cumulative TypeScript regression** introduced by the email redesign series, then prolonged by incomplete prop-restore fix commits.

| Milestone | SHA | Vercel | Role |
|-----------|-----|--------|------|
| **LAST KNOWN GOOD** | `78bf810d` | READY | Email layout/components only — build green |
| **FIRST BAD** | `f0d7b30b` | ERROR | Redesign primary customer/internal templates; props collapsed |
| Cascade peak | `d6871b03` … `5c2c2965` | ERROR | More redesigned templates + Playwright; same TS failure mode |
| Fix series | `382f4758` … `608e7620` | ERROR | Partial prop restores; each fixed one call-site, next error surfaced |
| **RECOVERED HEAD** | `a65979f5` | **READY** | Prop surface aligned with API call sites |

## Pattern

```
Commit A (f0d7b30) introduces problem
  → simplified email Props to { fullName?, actionUrl?, detail? }
Commit B–D redesign more templates the same way
  → more createElement call sites break typecheck
Commit E–O (fix attempts)
  → each restores a subset of props
  → next Vercel build fails on the *next* mismatched template
  → cumulative until full surface restored at a65979f
```

Not: independent failures per commit.  
Yes: one root cause + cascading incomplete fixes.

## Root cause (exact)

**Vercel / Next build typecheck** (`next build` → “Running TypeScript …”):

```text
Type error: No overload matches this call.
  Object literal may only specify known properties, and '<prop>' does not exist
  in type 'Attributes & Props'.
```

Observed props that failed across the series:

| Prop | Call site | Template (at failure time) |
|------|-----------|----------------------------|
| `invoiceNumber`, `amount`, `dueDate`, `paymentLink` | `src/app/api/admin/invoices/route.ts`, `send-trigger` | InvoiceEmail simplified |
| `projectName`, `liveUrl`, `proposalUrl`, `reviewLink`, `expiryDate`, `renewLink` | `send-trigger` | Project/Proposal/Testimonial/Maintenance |
| `dashboardUrl`, `unsubscribeUrl` | `src/app/api/cron/weekly-recognition/route.ts` | WeeklyRecognitionEmail |
| `seat` | `src/app/api/jobs/apply/route.ts` | JobApplicationEmail (`role` only) |
| `loginTimestamp`, `ipAddress`, `location`, … | `src/lib/email/send-login-notification.ts` | LoginNotificationEmail |
| `Budget` | contact/API lead paths | NewLeadNotificationEmail |
| `requestedAt` | newsletter route | NewsletterDoubleOptinEmail |
| `email` vs `fullName` | WelcomeEmail | WelcomeEmail |

Email redesign kept the **white / circular-logo / no-banner** design system (correct) but dropped **domain-specific props** still required by production API routes.

## Last 20 commits (78bf810 → HEAD) — Vercel evidence

| # | Commit | Message (short) | Vercel |
|---|--------|-----------------|--------|
| 1 | `78bf810` | email layout/header/footer/button/content | **READY** |
| 2 | `f0d7b30` | redesign primary customer/internal | ERROR |
| 3 | `bc138fb` | redesign internal lead/checklist/newsletter/jobs/login | ERROR |
| 4 | `1b1c28b` | redesign remaining operational | ERROR |
| 5 | `d6871b0` | redesign invoice/payment/proposal/project/maintenance | ERROR |
| 6 | `5c2c296` | Playwright + login mobile overflow | ERROR |
| 7 | `8d2fa77` | wire test:e2e Playwright | ERROR |
| 8 | `382f475` | export named WeeklyRecognitionEmail | ERROR |
| 9–19 | `f02399b` … `608e762` | sequential prop-restore fixes | ERROR |
| 20 | `a65979f` | NewsletterConfirmationEmail email + unsubscribeUrl | **READY** |

Commits before `78bf810` (booking fixes, login a11y, public site restore, etc.) were **READY** on Vercel and are not part of this regression.

## Why subsequent commits failed

1. Redesign commits changed **exports/interfaces only**, not the **call sites** in `src/app/api/**` and `src/lib/email/**`.
2. Next.js production build runs full project typecheck; **one** bad `createElement` fails the entire deploy.
3. Fix commits restored props **one template at a time**; each green local assumption still left another mismatched template for the next Vercel build.
4. Playwright/e2e commits (`5c2c296`, `8d2fa77`) did not introduce the type error but could not ship because the type error already blocked build.

## Minimal safe fix (already applied on main)

Restore **typed domain props** on email templates to match existing call sites, while keeping the professional white / no-banner design components.

No dependency upgrades. No UI redesign. No business-logic change. No blind `git reset --hard`.

## Validation evidence

### Vercel

- Deployment `dpl_23XViwpPM7RoPn9QwCNiDJnXV5zW` for commit `a65979f5` → **READY**
- HTML served from production includes `data-dpl-id="dpl_23XViwpPM7RoPn9QwCNiDJnXV5zW"`

### Production HTTP (live)

| Path | Status | Notes |
|------|--------|-------|
| `/` | 200 | Homepage |
| `/login` | 200 | Login |
| `/robots.txt` | 200 | SEO |
| `/sitemap.xml` | 200 | SEO |
| `/contact` | 307 → `/login?next=/contact` | Auth gate (product policy — verify intentional) |
| `/solutions` | 307 → login | Auth gate |
| `/ai` | 307 → `/login?next=/ai` | Expected for protected AI |
| `/packages`, `/careers` | 307 → login | Auth gate |

### Node consistency

- `.nvmrc`: `22`
- CI workflow: Node 22
- Aligned with Vercel production builds that reached READY

## Release decision context

Pipeline **build/deploy** is recovered.  
Remaining product questions (which marketing pages require login) are **HIGH** product/auth policy checks, not the original TypeScript deploy blocker.
