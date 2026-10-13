# Apply Visibility Engine content suggestions (Phase 3)

This is the **human-run** apply step. Approved content suggestions become a
**pull request** against the product repo. Nothing auto-publishes, and nothing
is ever pushed to `main`.

> Flow recap: the Content Engine generates `content_suggestions` (status
> `draft`) → a human Approves/Rejects them in the Command Center's
> `/admin/command-center/visibility` **Content** tab → this procedure turns the
> `approved` ones into a PR → a human merges → mark them `applied`.

## 0. Prerequisites

- The suggestions you want to ship are **approved** (Content tab).
- You have `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment
  (service-role; never commit them).
- You can push a branch and open a PR on the target product repo.

## 1. Export the approved suggestions

```bash
node scripts/apply-suggestions.mjs --entity voiceshield.logicintelligencetechnologies.in
```

This writes `.visibility-apply/<domain>/` containing `suggestions.json`, one
file per kind (`json_ld.json`, `faq.json`, `meta.json`,
`factual_sentences.txt`), and a ready-to-paste `PR-BODY.md`. It does **not**
touch any repo.

## 2. Implement idiomatically in the product repo

Create a branch (convention: `visibility/<page>-<YYYY-MM-DD>`; automated
Command Center sessions push to their designated integration branch instead)
and apply each kind the way that repo does things:

| Kind | How to apply |
| --- | --- |
| `json_ld` | A reusable `<JsonLd>` component injected into the page. **Next.js App Router:** a client-free component that renders `<script type="application/ld+json">`, included in the page body or via the metadata API. Validate the object on [Google Rich Results](https://search.google.com/test/rich-results). |
| `faq` | A **visible** FAQ section component rendered on the page (real content, never hidden), plus a matching `FAQPage` JSON-LD built from the same Q&A. |
| `meta` | Update the page's `metadata.title` / `metadata.description` (App Router) or `<Head>` (Pages Router). Respect length limits (~60 / ~155). |
| `factual_sentences` | Surface as real on-page copy where it fits (intro, feature blurb). Never keyword-stuff or hide text. |

Per-repo layout (from Phase 3 STEP 0):

| Repo | Framework | Home page | Metadata set in |
| --- | --- | --- | --- |
| `logicintelligencetechnologies` | Next 16 App Router | `src/app/(marketing)/page.tsx` | `metadata` export; existing `src/components/seo/json-ld.tsx` + `faq-accordion.tsx` |
| `lit-smart-hospital-platform` | Next (monorepo) | `apps/web/src/app/page.tsx` | `metadata` export (no JsonLd/FAQ yet — add one) |
| `logic-voice` | Vite/React SPA | `apps/web/src/pages/public/HomePage.tsx` | react-helmet-style head / existing `FAQPage.tsx` |
| `voice-shield` | Next 15 App Router | `app/page.tsx` | `metadata` export; see the example PR |

**Content integrity still applies at apply time** — only ship claims defensible
from the page; for healthcare keep it to software/management tooling (no
medical/clinical/outcome claims); for Voice Shield no efficacy numbers unless
the site already publishes them.

## 3. Open the PR (human merges)

Push the branch and open a PR using `PR-BODY.md` as the description. Do **not**
enable auto-merge. A human reviews and merges. Validate any JSON-LD on Google
Rich Results against the PR preview deploy first.

See `voice-shield` for a worked example PR (reusable `JsonLd` component +
`Organization`/`SoftwareApplication` JSON-LD + a visible homepage FAQ section
with matching `FAQPage` JSON-LD).

## 4. After merge: mark applied

```bash
node scripts/apply-suggestions.mjs \
  --entity voiceshield.logicintelligencetechnologies.in \
  --mark-applied --pr https://github.com/vikashsaravanann/voice-shield/pull/NN
```

This flips those suggestions to `status='applied'` and stores `pr_url` (shown in
the Content tab). Keep it this simple in Phase 3; a tiny merge webhook can call
the same PATCH later if you want it automated.
