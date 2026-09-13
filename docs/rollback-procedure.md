# Rollback Procedure

This document provides step-by-step instructions for safely reverting a deployment in the event of a critical failure.

## When to Roll Back
Rollbacks should be initiated if any of the following occur after a deployment:
- Critical pages return HTTP 500 errors.
- Authentication or login flows are broken.
- Client data is exposed or RLS policies are misconfigured.
- Database migrations fail or cause data corruption.
- Severe performance degradation.
- Security vulnerabilities are identified.

## 1. Rollback via Vercel (Instant Revert)
The fastest way to restore service is to rollback the deployment on Vercel without changing the Git history.

1. Go to the [Vercel Dashboard](https://vercel.com).
2. Navigate to the Logic Intelligence Technologies project.
3. Go to the **Deployments** tab.
4. Find the last known successful deployment (look for the `Ready` status and a green check from previous runs).
5. Click the three dots (`...`) next to the successful deployment.
6. Select **Promote to Production** or **Assign Custom Domains** to instantly route traffic back to this safe build.
7. Verify the canonical domain `https://www.logicintelligencetechnologies.in/` is functioning.

## 2. Revert via Git (Permanent Fix)
To ensure the `main` branch reflects the safe state (so the next developer doesn't deploy the broken code again), you must revert the bad commit in Git.

**NEVER FORCE PUSH TO `main` TO DELETE HISTORY.**

1. Identify the bad commit hash on `main`.
2. Create a revert commit:
   ```bash
   git checkout main
   git pull origin main
   git revert <bad-commit-hash>
   ```
3. Push the revert to `main` (if branch protection allows), or open a PR for the revert.
   ```bash
   git checkout -b fix/revert-bad-deployment
   git commit -m "fix: Revert bad deployment <commit-hash>"
   git push origin fix/revert-bad-deployment
   ```
4. Merge the revert PR. This will trigger a new Vercel deployment of the previously safe state.

## 3. Database Migration Rollbacks
If the deployment included a broken Supabase migration:
1. **DO NOT** just revert the code. The database schema has already changed.
2. Manually apply the down-migration via the Supabase Dashboard or CLI.
3. Once the database is stable, proceed with the Vercel and Git rollbacks.
4. Document the incident in a post-mortem issue.
