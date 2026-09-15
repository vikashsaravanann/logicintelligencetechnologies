# Email design system — Logic Intelligence Technologies

## Principles

- White page and card background (`#ffffff`)
- Centered 640px container
- Circular official logo (64px) + single-line company name
- **No banner images** in any outgoing email
- Short, professional, human copy
- One primary CTA when action is required
- Email-safe fonts: Arial, Helvetica, sans-serif
- Gmail / Outlook / Apple Mail compatible

## Components

- `email-layout.tsx` — white shell
- `email-header.tsx` — circular logo + name
- `email-footer.tsx` — site · privacy · terms · contact
- `email-button.tsx` — primary CTA
- `email-content.tsx` — title/greeting/body helpers
- `email-styles.ts` — tokens

## Rules

1. No banner / dark full-bleed headers
2. No secrets in body
3. Preserve Reply-To and outbox at send layer
