# Navigation Architecture & Back Button System

**Company:** Logic Intelligence Technologies  
**Component:** `src/components/navigation/BackButton.tsx`  

---

## 1. Primary Objectives
1. Provide a single, unified `<BackButton />` across every detail page, subpage, and modal flow.
2. Eliminate disjointed, hand-rolled back links with inconsistent labels or styling.
3. Ensure context-aware fallback destinations so visitors never encounter broken or dead navigation paths.
4. Support browser history backward navigation when safe and same-origin, with instantaneous fallback.

---

## 2. Standardized Fallback Mappings

| Page Type | Route Pattern | Back Button Label | Fallback Target |
|---|---|---|---|
| **Blog Article** | `/blog/[slug]` | "Back to Blog" | `/blog` |
| **Work Detail** | `/work/[slug]` | "Back to Work" | `/work` |
| **Service Detail** | `/services/[slug]` | "Back to Solutions" | `/services` |
| **Industry Detail** | `/industries/[slug]` | "Back to Industries" | `/industries` |
| **Product Detail** | `/products/[slug]` | "Back to Products" | `/products` |
| **Resource Detail** | `/resources/[slug]` | "Back to Resources" | `/resources` |
| **Packages Detail** | `/packages/[slug]` | "Back to Packages" | `/packages` |
| **Founder Profile** | `/about/founder` | "Back to About" | `/about` |
| **Proposal Detail** | `/admin/proposals/[id]` | "Back to Proposals" | `/admin/proposals` |
| **Lead Detail** | `/admin/leads/[id]` | "Back to Leads Ledger" | `/admin/leads` |
| **Client Project** | `/client/projects/[id]` | "Back to Projects" | `/client/projects` |
| **Client Subpages** | `/client/projects`, `/client/invoices`, `/client/documents`, `/client/messages`, `/client/support` | "Back to Dashboard" | `/client/dashboard` |
| **Support Hub** | `/support/[ticketId]`, `/support/new` | "Back to Support" | `/support` |
| **Profile Page** | `/profile` | "Back to Home" | `/` |
| **Sign In** | `/login`, `/reset-password` | "Back to Home" / "Back to Sign In" | `/` / `/login` |

---

## 3. Visual & Accessibility Standards
- **Styling:** Pill design with contrast border, subtle backdrop blur, and active scale animations.
- **Focus Rings:** High-visibility `:focus-visible` ring in cyan (`ring-cyan-400`).
- **Screen Readers:** Explicit `aria-label` matching button content; decorative icon hidden via `aria-hidden="true"`.
- **Keyboard Navigation:** Native `<a>` link behavior with Enter and Space key support.
