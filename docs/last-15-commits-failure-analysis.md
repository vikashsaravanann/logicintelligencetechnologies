# Last 15+ commits failure analysis

## Last known good

- **SHA:** `78bf810`
- **Message:** `feat(email): layout, header, footer, button, content components`
- **Vercel:** READY

## First bad

- **SHA:** `f0d7b30`
- **Message:** `feat(email): redesign primary customer and internal templates`
- **Vercel:** ERROR (`npm run build` / TypeScript)

## Root cause

Email template redesign replaced operational React Email components with a shared white design system, but **narrowed TypeScript Props** relative to existing `React.createElement(...)` call sites in:

- `src/app/api/**`
- `src/lib/email/**`
- cron routes

TypeScript then failed with:

```text
Type error: No overload matches this call.
Object literal may only specify known properties, and '<prop>' does not exist in type 'Attributes & Props'.
```

## Why later commits failed

**Cumulative (pattern A):** each subsequent commit either did not restore all missing props or fixed one template while another call site still mismatched. Vercel remained ERROR from `f0d7b30` through the iterative prop fixes until all call-site props are accepted.

## Fix strategy

Restore **full optional prop surfaces** on every redesigned template to match real call sites, without changing runtime email architecture (outbox, idempotency, Reply-To).

## Validation targets

- Vercel build READY for tip of main
- Production domain still healthy during recovery
- Playwright suite remains valid against production
