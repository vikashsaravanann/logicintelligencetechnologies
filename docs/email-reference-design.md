# Email reference designs

This isolated reference collection explores ten email families for Logic Intelligence Technologies. The collection lives in `emails/reference-design/`; its shared theme and components supply the visual system, `templates.tsx` supplies the ten named templates, and `previews.tsx` supplies fixed, fictional examples. It does not change the production sender, outbox, or existing template routing.

## Reference families

| Preview key | Family | Category | Reference direction |
| --- | --- | --- | --- |
| `reference-email-verification` | Email verification | Security | Illustrated verification |
| `reference-welcome` | Welcome | Lifecycle | A warm welcome |
| `reference-campaign` | Campaign | Marketing | Light editorial campaign |
| `reference-dark-campaign` | Dark campaign | Marketing | After-dark campaign |
| `reference-onboarding` | Project onboarding | Lifecycle | Guided project onboarding |
| `reference-staff-invitation` | Staff invitation | HR | Workspace invitation |
| `reference-stage-approval` | Stage approval | Operational | Milestone celebration |
| `reference-invoice-payment` | Invoice & payment | Billing | Clear billing summary |
| `reference-support-reply` | Support reply | Operational | Human support conversation |
| `reference-maintenance-activation` | Maintenance activation | Transactional | Ongoing project care |

The billing template also supports `payment_verified`; the collection selects `invoice_ready` for its one billing preview. The maintenance preview shows a paid plan. Other conditional states require separate review.

## Regenerate

The ten designs are registered under `reference-*` in the existing admin email preview registry. Existing send triggers and authentication-provider templates are unchanged. Import production components from `emails/reference-design` and pass event-specific data rather than importing the preview fixture catalog into a sending path.

The reference family uses Nunito Sans (SIL Open Font License, included alongside the font) with Arial/Helvetica fallbacks, original locally generated artwork, the existing company logo and canonical company/social configuration. Regenerate artwork with `npm run emails:reference:artwork`; regenerate email previews with `npm run emails:reference -- [output-directory]`.

From the repository root, with dependencies, templates, and public artwork available:

```sh
npx tsx scripts/render-reference-emails.tsx
```

The default output directory is:

```text
artifacts/email-reference-designs
```

Pass a directory as the sole argument to change the destination:

```sh
npx tsx scripts/render-reference-emails.tsx /tmp/lit-email-designs
```

The renderer uses React Email's `render` and `toPlainText` utilities. It renders and validates required preview assets before writing the collection. Repeating the command overwrites the matching output files; it does not clear unrelated files in the destination. No network fetch or email delivery occurs.

| Output | Purpose |
| --- | --- |
| `index.html` | Standalone gallery embedding all ten previews, plain-text views, and original HTML downloads. Ten navigation links support direct selection through URL fragments. Desktop and mobile controls change the iframe preview width. |
| `html/<preview-key>.html` | Original rendered email HTML with absolute company website asset URLs, suitable as an integration starting point. The gallery's HTML download returns this original. |
| `previews/<preview-key>.html` | Standalone browser preview with local public artwork, logo, and available fonts embedded as data URLs. Links open outside the preview. |
| `text/<preview-key>.txt` | Plain-text alternative generated from the original HTML. |

Open `index.html` directly in a browser; the gallery needs neither a development server nor sibling files. Browser previews use a sandboxed iframe. The mobile setting caps the frame at 390 pixels; on a narrower screen it fits the available width. The iframe has its own vertical scroll area.

## Artwork and fonts

Original email HTML uses the official origin, `https://www.logicintelligencetechnologies.in`, with artwork under `/email-assets/reference/` and the existing logo at `/assets/logo-icon.jpg`. Public artwork is expected at:

```text
public/email-assets/reference/
  verification.png
  welcome.png
  campaign.png
  night.png
  onboarding.png
  workspace.png
  milestone.png
  payment.png
  support.png
  maintenance.png
  social-linkedin.png
  social-instagram.png
  social-x.png
  social-youtube.png
  nunito-sans-latin.woff2
public/assets/logo-icon.jpg
```

Optional light social-icon variants in that artwork directory are also embedded when referenced. The renderer replaces matching artwork URLs and CSS font `url()` references with data URLs in previews only. Missing referenced images stop rendering with the public asset path in the error. If a referenced WOFF/WOFF2 font is missing, the script warns and retains its absolute URL; offline viewing then uses the template's fallback fonts. Providing the font makes that preview self-contained as well. These assets must be published at their absolute URLs before using the original HTML for delivery.

## Fixture safety and review limits

Sample people, project details, identifiers, invoice values, dates, and document names are fictional. The maintenance preview uses the configured Basic Care example price (₹5,898.82 including GST), without representing a real purchase. The fixture company/project is **Example Project**, and the sample recipient uses `example.com`. Calls to action use the official website's existing `/login` or `/contact` route. Marketing previews link to the existing `/unsubscribe` page. These are safe design placeholders without fabricated verification tokens, signed document URLs, or credentials; they do not implement a recipient's verification, document retrieval, or unsubscribe action. Sample documents are links to login and are explicitly not marked as attached.

Before integrating a template, pass the real event's authorized destination, validated data, and applicable attachment metadata through the existing email pipeline. Supply genuine recipient-specific verification and unsubscribe links where required. Reference labels describe the design direction; they do not claim a third-party source or a tested email-client result.

**Real-email compatibility is unverified.** A browser rendering does not establish behavior in Gmail, Outlook, Apple Mail, dark mode, image blocking, or clients that ignore web fonts. Review those clients and the relevant conditional template states separately. No live emails have been sent or deployed by this reference workflow.

## Complete company migration — 18 October 2026

All 40 existing company templates now use the reference-family shared layout, purpose-specific illustration, Nunito Sans with Arial fallback, centered logo and single-line uppercase company name, pill actions, and monochrome social footer. Existing data props, recipient selection, links, and attachment rules are preserved. Detailed tables keep semantic status colors and wrap long identifiers on mobile.

Four provider-native authentication HTML files are regenerated with `npm run emails:auth`, preserving Supabase confirmation placeholders. Updating these files does not update the hosted Supabase dashboard configuration automatically.

Operational notices cover nine subscription/trial/correction event keys and the proposal-acceptance fallback, using the same shared design. Fresh queued notifications include rendered HTML and plain text. Existing stored outbox HTML is intentionally unchanged; this migration does not rewrite or resend historical messages. Existing recipients are preserved, including internal notification recipients.

`npm run emails:all -- /absolute/output/folder` produces the complete gallery, individual production HTML, standalone offline previews, plain text, and a machine-readable manifest. Review fixtures use fictional data. The reference-only command remains available.

No production deployment, provider configuration change, account change, or real email send is part of this local design implementation. Email-client differences remain: some clients use Arial, block images, alter colors in dark mode, or render buttons differently. Browser checks establish local responsiveness, not inbox delivery or identical rendering in every mail client.
