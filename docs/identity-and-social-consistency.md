# Identity and Social Consistency

This document outlines the strict protocol for maintaining cross-platform identity consistency for Vikash Saravanan and Logic Intelligence Technologies.

## 1. Social Links
All public profiles must link directly back to the canonical sources. The verified list of URLs is:
- **Corporate Website**: https://www.logicintelligencetechnologies.in/
- **Personal Portfolio**: https://vikashsaravanann.github.io/startupwithvikash/
- **LinkedIn**: https://www.linkedin.com/in/vikash-saravanan-j7528/
- **GitHub**: https://github.com/vikashsaravanann
- **Instagram**: https://www.instagram.com/vikash.saravanann

## 2. Branding Guidelines
- Do not fabricate alternative URLs or abbreviate handles.
- Use `Vikash S` only in constrained UI circumstances where full name does not fit; otherwise, strictly use `Vikash Saravanan`.
- The primary title is `Founder & Lead Systems Engineer`.

## 3. Central Configuration
All social links are maintained centrally in `src/config/founder.ts`. Any new social platform or update to a handle must happen in this file to propagate to the AI knowledge base, JSON-LD schema, and the UI.
