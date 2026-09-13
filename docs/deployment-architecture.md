# Deployment Architecture

## Overview
Logic Intelligence Technologies relies on a highly structured, automated CI/CD pipeline leveraging **GitHub Actions** as the primary validation authority and **Vercel** for continuous deployment.

This architecture enforces maximum safety, ensuring that untested or broken code is never deployed to the production environment.

## The Pipeline

### 1. Feature Branches and Pull Requests
- Developers create `feature/*`, `fix/*`, or `chore/*` branches from `main`.
- When a PR is opened against `main`, the **Preview Workflow** is triggered.
  - **CI Validation:** Lints, typechecks, tests, and security scans run.
  - **Preview Deployment:** Vercel automatically creates a preview deployment.
  - **Smoke Testing:** The preview URL is extracted and a suite of HTTP smoke tests is run against critical routes.

### 2. Integration & Merge
- Pull Requests require passing status checks from the CI and Preview Smoke Tests before they can be merged.
- Force pushing to `main` is strictly forbidden.
- Once approved and merged into `main`, the **Production Workflow** triggers.

### 3. Production Deployment
- **Validation (Again):** Full test suite runs on the merged `main` commit.
- **Deployment:** Vercel natively deploys the updated `main` branch to production.
- **Verification:**
  - The CI pipeline waits for the Vercel deployment to reach the `READY` state.
  - Smoke tests are executed directly against the canonical domain `https://www.logicintelligencetechnologies.in/` to ensure no unexpected failures or redirects have occurred.
- **Reporting:** A deployment report is generated summarizing the release.

## System Components

- **Source Control:** GitHub
- **Validation Authority:** GitHub Actions
- **Hosting / Edge:** Vercel
- **Database & Auth:** Supabase (Migrations must be reviewed separately; destructive migrations are explicitly blocked from automatic deployment)
- **Monitoring & Analytics:** Vercel Analytics and Speed Insights

## Key Constraints
- **No Force Pushes** to `main`.
- **No Manual Deploys** bypassing GitHub Actions checks unless in an extreme emergency.
- **No Automatic Fixes** on security, auth, database, or payment logic.
