# Admin Production Verification

Canonical: `/admin/command-center`

Verified in code audit:
- New-lead email has Open Admin Dashboard + Open Leads via EMAIL.siteUrl
- AdminNav + admin-nav config complete
- AdminTriggers session-only (no CRON in UI)
- Support tickets not linked to public /support/[id]

NOT VERIFIED in this session (no admin credentials / live mail clients):
- Interactive login → command-center browser flow
- Invoice create + email delivery end-to-end
- Gmail/Outlook pixel-perfect render
