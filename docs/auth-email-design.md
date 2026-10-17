# Supabase auth email design

The four native Supabase HTML templates use the approved reference email family. These are generated local files ready for provider configuration review; they have **not been applied to a live Supabase project**. No authentication settings, database configuration, subjects, redirects, or email delivery integrations were changed, and no messages were sent.

## Source and regeneration

Edit `scripts/render-auth-email-templates.tsx`, then run from the repository root:

```sh
npx tsx scripts/render-auth-email-templates.tsx
```

Verify that the generated files match their React source without writing:

```sh
npx tsx scripts/render-auth-email-templates.tsx --check
```

The script resolves output paths relative to itself and writes only the four files listed below. It reuses `ReferenceFrame`, `ReferenceHero`, `ReferenceSection`, `ReferenceText`, and `ReferenceButton` from `emails/reference-design/components.tsx`, with brand, typography, and asset URLs from `emails/reference-design/theme.ts`. Shared components and theme remain owned by the main implementation.

| Native template | Heading | Illustration | Pill CTA |
| --- | --- | --- | --- |
| `supabase/templates/confirmation.html` | Verify your email address | `verification.png`, compact 280px | Orange: Verify my email |
| `supabase/templates/recovery.html` | Reset your password | `verification.png`, compact 280px | Purple: Reset my password |
| `supabase/templates/invite.html` | You’re invited to join us. | `workspace.png`, compact 280px | Blue: Accept my invitation |
| `supabase/templates/magic_link.html` | Your sign-in link is here. | `verification.png`, compact 280px | Orange: Sign in to my account |

All four use the light frame: centered company logo and name, white content, rounded sans typography, colorful flat art, a cream fallback URL panel, and the shared light footer with support, social, account, and legal links. Authentication emails do not include a marketing unsubscribe footer. The copy does not invent expiry durations, workspace permissions, account security guarantees, or completed setup.

## Provider placeholder preservation

Before regeneration, each original HTML file contained only the exact provider expression `{{ .ConfirmationURL }}`, three times. No other provider placeholders were present. The expression and its whitespace are retained verbatim; no provider URL is constructed or replaced with an application route. Supabase documents this variable in its [email template reference](https://supabase.com/docs/guides/auth/auth-email-templates).

| Template | Original expression count | Generated expression count | Other provider expressions |
| --- | ---: | ---: | --- |
| `confirmation.html` | 3 | 4 | None |
| `recovery.html` | 3 | 4 | None |
| `invite.html` | 3 | 4 | None |
| `magic_link.html` | 3 | 4 | None |
| **Total** | **12** | **16** | **None** |

The additional occurrence is the shared button’s Outlook VML link. The four generated uses are the Outlook CTA `href`, standard HTML CTA `href`, fallback anchor `href`, and visible fallback URL. The original button, fallback link, and copyable URL therefore all retain the provider expression.

`ReferenceButton` requires a valid HTTPS URL. During rendering only, the script supplies `https://auth-template.invalid/supabase-confirmation-url` to the CTA and fallback anchor. After React Email rendering, it replaces **only that exact URL** with the original `{{ .ConfirmationURL }}`. It verifies four sentinel occurrences before replacement, four provider expressions afterward, three provider `href` attributes, and no remaining sentinel. No URL-encoding or HTML-escaping is applied to the provider expression after replacement.

Every generation compares the incoming and rendered provider expression inventories before writing. Unknown provider expressions or a reduced occurrence count fail validation, so future additions cannot silently disappear. The script renders and validates all four outputs before beginning writes. On subsequent runs, preservation checks report four occurrences before and after.

## Asset and output checks

Logo, hero, social icons, and fonts retain absolute HTTPS URLs from the shared theme. Artwork is referenced under the company website’s `/email-assets/reference/` path; assets are not embedded as data URLs or attachments. The script checks absolute HTTPS links and CSS font URLs, compact artwork, shared branding and footer, light social icons, light color-scheme metadata, Outlook button markup, and absence of scripts or unresolved sentinels.

Generation and `--check` validate local output, not remote asset availability, provider delivery, authentication redirects, or inbox rendering. The shared artwork and fonts must be available at their absolute production URLs before these templates are enabled. Fonts have the shared Arial/Helvetica/sans-serif fallback. Cross-client inbox rendering and a real provider-generated link should be checked as part of any later, separately authorized activation.

The generated files are native HTML with Supabase expressions, not React source. Their bodies can be reviewed for the corresponding Supabase template slots using the [official template guidance](https://supabase.com/docs/guides/auth/auth-email-templates). This work does not update those slots or make the design live.
