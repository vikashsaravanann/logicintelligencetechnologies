# Staff security and synthetic collaboration release gates

This branch **does not** activate mandatory MFA in production. It adds a
feature-flagged staff-page / staff-API gate, an authenticator challenge UI, a
production dependency audit and authenticated browser tests.

## 1. Supabase leaked-password protection (dashboard action)

Target Supabase project: `lcmbwalrupoyparxsnjw` (verify the Vercel
production environment points at this project before changing settings).

- In the Supabase Dashboard open **Authentication → Settings** and locate
  password security / leaked-password protection (the precise UI label may
  change).
- Enable **Prevent use of leaked passwords** and save.
- This option requires an eligible Supabase plan (Pro or above).
- Rerun **Security Advisor** and confirm the
  `auth_leaked_password_protection` finding is resolved.
- Verify test sign-up / password change using safely generated synthetic
  passwords, not real employee credentials.

This Auth setting is not managed by a repository migration. Do not pretend
that a code commit enabled it.

## 2. Production-only dependency audit

The security GitHub Actions workflow now runs:

```bash
npm ci
npm audit --omit=dev --audit-level=high --json
```

A nonzero audit code, including an unavailable registry, fails the check.
A sanitized JSON audit artifact is saved for investigation. Review
`npm audit fix --dry-run` and patch deliberately; never run an unchecked
`npm audit fix --force` on the production branch.

Locally on a machine with network and a trusted npm registry:

```bash
npm ci
npm audit --omit=dev --audit-level=high --registry=https://registry.npmjs.org/
```

Record the timestamp, registry, commit SHA, exit code and remaining
high/critical findings in the release report.

## 3. Synthetic authenticated handoff and form E2E

Use an **isolated HTTPS preview/staging deployment** with its own Supabase
project. Do not run synthetic data changes on production. Configure the
GitHub Actions `staging` environment:

Secrets:
- `E2E_CLIENT_EMAIL`
- `E2E_CLIENT_PASSWORD`
- `E2E_STAFF_EMAIL`
- `E2E_STAFF_PASSWORD`

Variables:
- `E2E_PROJECT_LABEL` (exact project title visible to the assigned staff)
- `E2E_ENGAGEMENT_REF` (engagement reference accepted by the client RFC form)

Provision a synthetic client, an active verified staff identity, an explicit
engagement/project mapping, an active staff assignment, and MFA as required
by the staging rollout. Use administrative provisioning through the existing
authorized system, not a public test-backdoor API.

In GitHub Actions, run **Synthetic Staff Handoff E2E** manually and supply
the staging/preview URL. The job **fails** if fixtures are absent. It verifies
assigned project visibility, client message persistence, staff reply, client
receipt and a new client RFC surviving reload. Playwright runs on Chromium,
Firefox, WebKit, Pixel Chrome and iPhone Safari and uploads failure evidence.

The CI test does not currently perform initial assignment creation itself;
it requires an approved synthetic assignment fixture. Add separate
Super Admin assignment-create/revoke E2E after its UI contract has been
verified. Do not call the full assignment lifecycle COMPLETE until that
additional test is demonstrated.

## 4. Staged AAL2 rollout (not yet production enabled)

- The existing TOTP enrollment page is
  `/staff/settings/security/mfa`.
- The new TOTP challenge page is `/staff/mfa/challenge`.
- A feature-flagged middleware guard covers `/staff/*` and `/api/staff/*`.
- The guard allows password setup, enrollment and authenticator challenge
  without AAL2 to avoid recovery loops.
- When `STAFF_MFA_REQUIRED=true`, a session at AAL1 is redirected to
  enrollment/challenge for pages; staff APIs reject with `MFA_REQUIRED`.

Release checklist BEFORE enabling the flag:

1. Enroll synthetic staff and complete a successful TOTP challenge.
2. Verify AAL1 GET/POST to every staff API is denied.
3. Verify AAL2 access is allowed only with the user's project and role grants.
4. Test missing factor, invalid TOTP, expired session, device loss, suspended
   account, first-login password setup and return-path safety.
5. Verify middleware, Server Components, route handlers and Supabase RLS
   agree on the policy; note that any direct Supabase client queries require
   suitable RLS checks and any staff APIs under different prefixes require
   additional protection.
6. Implement and approve recovery procedures before mandatory enforcement.
7. Enable the flag in STAGING, run authenticated E2E, inspect results.
8. Roll out in production only after an approved account recovery and
   staged enrollment plan, with ready rollback controls.

AAL2 enrollment UI alone is NOT proof of MFA enforcement. The flag
remaining false is an honest `NOT ENFORCED IN PRODUCTION` state.

## 5. Release evidence required

- Supabase advisor no longer reports leaked password protection disabled.
- Production dependency audit passes with registry access and stored artifact.
- Browser E2E run is not skipped and includes trace/screenshots as applicable.
- MFA middleware/API and factor flow tests pass on staging.
- Actual production deployment commit and smoke test are verified.
- No unresolved critical or high findings are silently reclassified as PASS.
