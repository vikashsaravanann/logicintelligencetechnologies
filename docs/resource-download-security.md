# Resource Download Security

## Architecture

1. Form on `/resources/[slug]`
2. `POST /api/resources/[slug]/request-access` — validate, rate-limit, store lead, issue HMAC token (15 min)
3. `GET /api/resources/[slug]/download?token=` — verify token, stream PDF

## Gated vs public

- Gated: all Resource Center PDFs except press kit
- Public: press-kit.pdf

## Middleware

404 for `/resources/*.pdf` except press-kit; 404 for `/checklist.pdf`
