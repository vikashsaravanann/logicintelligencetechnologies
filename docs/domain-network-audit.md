# Domain / network audit

Canonical: `https://www.logicintelligencetechnologies.in/`

Checked in repository (code):

- `COMPANY.websiteUrl` and `NEXT_PUBLIC_SITE_URL` are the intended production origin.
- Auth callback uses `window.location.origin` + `/auth/callback?next=`.
- Email site URL falls back to `COMPANY.websiteUrl`.

Live checks this session:

| Check | Result |
|---|---|
| HTTPS homepage | **NOT VERIFIED in this sandbox as a full browser pass** — fetch may be done separately |
| Vercel project domains | **NOT VERIFIED — Vercel token invalid** |
| Apex vs www | **NOT VERIFIED — DNS dashboard access required** |
| Supabase Site URL / redirect allow-list | **MANUAL:** must include `https://www.logicintelligencetechnologies.in/**` and `/auth/callback` |
| Google OAuth redirect | **MANUAL:** `{canonical}/auth/callback` |

Do not treat this document as proof that DNS is fixed.
