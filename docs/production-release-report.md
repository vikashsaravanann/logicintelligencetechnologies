# Production Release Report — Logic Intelligence Technologies

**Date:** 2026-09-16  
**Branch:** `main`  
**Commit:** `a65979f5f3024b1f3b3241c40a5601bb22f0c409`  
**Message:** `fix(email): NewsletterConfirmationEmail accepts email + unsubscribeUrl`

## 1. Release summary

Production build/deploy recovered after a cumulative TypeScript regression caused by email template redesigns that dropped domain-specific props still required by API routes. HEAD deploys successfully on Vercel; the live domain serves that deployment. Critical public endpoints respond; several marketing routes currently redirect to login (confirm intentional).

## 2. Deployment

| Field | Value |
|-------|--------|
| Vercel project | `logic-intelligence-technologies` (`prj_owHLMU3UgUbjFhwTlEe9NxpYvJvc`) |
| Deployment ID | `dpl_23XViwpPM7RoPn9QwCNiDJnXV5zW` |
| Ready state | **READY** |
| Production URL | https://www.logicintelligencetechnologies.in/ |
| Evidence | Live HTML `data-dpl-id="dpl_23XViwpPM7RoPn9QwCNiDJnXV5zW"`; Vercel API `readyState: READY` for `a65979f5` |

## 3. Last known good → recovery

| | SHA | Vercel |
|-|-----|--------|
| Last known good | `78bf810d` | READY |
| First bad | `f0d7b30b` | ERROR |
| Recovered HEAD | `a65979f5` | READY |

**Root cause:** Email redesign simplified Props interfaces; API `React.createElement` still passed domain props → Next typecheck failed on every production build until props were restored.

## 4. Validation matrix

| Area | Result | Evidence |
|------|--------|----------|
| GitHub main | PASS | `a65979f` on `origin/main` |
| Vercel deployment | PASS | READY `dpl_23XViwp…` |
| Production domain | PASS | HTTPS 200 `/`, HSTS present |
| Homepage | PASS | HTTP 200, HTML rendered |
| Login page | PASS | HTTP 200 |
| `/ai` logged-out | PASS | 307 → `/login?next=/ai` |
| robots.txt | PASS | 200 |
| sitemap.xml | PASS | 200 |
| Local typecheck/build | BLOCKED | Sandbox npm registry 502; validated via Vercel build logs instead |
| GitHub Actions CI | BLOCKED | No authenticated Actions log access in this session; deploy path recovered independently |
| Playwright E2E | BLOCKED | Requires browser install + auth fixtures; scripts exist (`playwright test`) |
| Book Consultation live submit | BLOCKED | No controlled production test credentials used in this gate |
| Email live delivery | BLOCKED | Provider delivery not exercised this session |
| Full AI logged-in | BLOCKED | Requires authenticated session |

## 5. Issues fixed (this recovery)

- Restored domain props on transactional/operational email templates
- Aligned WelcomeEmail / WeeklyRecognition / JobApplication (`seat`) / LoginNotification / NewLead (`Budget`) / Newsletter / LeadConfirmation interfaces with call sites
- Preserved white background, circular logo, no-banner email design system

## 6. Remaining issues

| Severity | Issue |
|----------|--------|
| HIGH | `/contact`, `/solutions`, `/packages`, `/careers` return 307 → login. Confirm whether middleware should leave these public. |
| MEDIUM | Multiple sequential fix commits during recovery; history is noisy but main is green. |
| LOW | Playwright suite added but not executed in this release gate. |
| EXTERNAL | Full form/email/AI live delivery needs controlled accounts and provider credentials. |

## 7. Security notes

- No secrets printed in this report.
- Production serves over HTTPS with `strict-transport-security`.
- `/ai` correctly gated behind login redirect.

## 8. Final release decision

```text
READY EXCEPT FOR EXTERNAL BLOCKER
```

**Rationale:** Build and Vercel production deployment for the intended commit are verified live. External blockers remain for authenticated form/email/AI end-to-end production exercises and for confirming whether marketing routes should be public.
