# Release Process

This document outlines the standard release process for the Logic Intelligence Technologies platform.

## Branch Strategy
- `main`: The single source of truth for production. Code on `main` is always deployed.
- `feature/*`: For new additions.
- `fix/*`: For bug fixes.
- `chore/*`: For repository maintenance, dependencies, and configuration.

## Pre-Release (Pull Request)
1. **Open a PR:** Ensure your branch name follows the conventions.
2. **Automated Checks:** The PR will automatically trigger the CI workflow.
   - Wait for `build`, `lint`, `typecheck`, and `test` jobs to pass.
   - Wait for the Vercel Preview Deployment to complete.
   - Wait for the Smoke Tests to pass against the Preview URL.
3. **Manual Review:** If the code affects Auth, RLS, Payments, or Security, it MUST receive a human review. Automated approvals are disabled for these areas.
4. **Approval:** Once approved by a peer or the repository owner, the PR can be merged using a Squash or Rebase merge to maintain a clean history.

## Release (Production)
1. **Merge to `main`:** This automatically triggers the Vercel Production deployment and the `production.yml` GitHub Action.
2. **Monitor the Release:**
   - Watch the `production.yml` workflow.
   - The workflow will verify the Vercel deployment status and run smoke tests against `https://www.logicintelligencetechnologies.in/`.
3. **Verify:**
   - Confirm that the final deployment report shows `PRODUCTION_VERIFIED`.

## Automatic Error Repair (CI)
If a trivial error (e.g., linting or missing unused imports) occurs during a PR, a GitHub Action may attempt an automatic repair:
1. It will apply a safe deterministic fix.
2. It will re-run the CI suite.
3. If successful, it pushes the fix to the branch.
4. **Max Attempts:** 2 per workflow run to prevent infinite loops.
5. **Forbidden Fixes:** Will not attempt to auto-fix authorization, security rules, database schemas, or production secrets.

## Hotfixes
In the event of a critical production bug:
1. Create a `fix/hotfix-*` branch from `main`.
2. Apply the fix.
3. Open a PR and request expedited review.
4. Merge as normal. **Do not bypass CI unless the pipeline itself is fundamentally broken.**
