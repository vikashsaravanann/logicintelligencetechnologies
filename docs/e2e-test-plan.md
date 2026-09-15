# E2E test plan — Logic Intelligence Technologies

## Architecture

- Runner: Playwright (`@playwright/test`)
- Config: `playwright.config.ts`
- Specs: `tests/e2e/**/*.spec.ts`
- Default `baseURL`: production `https://www.logicintelligencetechnologies.in`
- Override: `PLAYWRIGHT_BASE_URL=http://localhost:3000`

## Coverage

| Area | Spec |
|---|---|
| Login 320–414 overflow | `responsive/login-viewports.spec.ts` |
| Auth gate / protected routes | `auth/protected-routes.spec.ts` |
| Homepage / health / SEO | `navigation/public-and-footer.spec.ts` |
| Form API contracts | `forms/contact-api.spec.ts` |
| AI auth | `ai/routes.spec.ts` |

## Commands

```bash
npx playwright install chromium
npm run test:e2e
```

## Auth credentials (optional)

```
E2E_TEST_EMAIL=
E2E_TEST_PASSWORD=
```
