# Glassmorphism Design Audit — 2026-09-17

## Commit
- `c5f6455` feat(ui): AI Coming Soon + Jobs CEO glass panel + glass tokens
- Follow-up: middleware public paths for `/jobs`, `/ai-assistant`, `/booking`, `/proposal`

## Design tokens (`src/app/globals.css`)
- `--glass-bg`, `--glass-bg-strong`, `--glass-bg-soft`, `--glass-bg-elevated`
- `--glass-border`, `--glass-border-strong`, `--glass-border-accent`
- `--glass-blur`, `--glass-blur-strong`
- `--glass-shadow`, `--glass-shadow-lg`
- `--glass-radius*`
- Utilities: `.glass-surface`, `.glass-surface-strong`, `.glass-panel`, `.glass-card`, `.glass-nav`, `.glass-input`
- Fallback when `backdrop-filter` unsupported: solid `#0c1220`
- `prefers-reduced-motion` respected for card transitions

## Shared component
- `src/components/ui/glass-surface.tsx` — variants: surface | strong | panel | card | nav | soft
- Prefer this over ad-hoc `backdrop-blur` classes

## AI Coming Soon
- File: `src/app/ai/page.tsx`
- Public landing primary CTA: **Coming Soon** (was Get Started)
- Behavior: `onClick={() => setComingSoonNote(true)}` only
- Does **not** call auth, router, setLanded(false), or AI APIs
- Shows status: "AI Workspace — Coming soon - we are preparing the next generation of the Logic Intelligence Technologies AI experience."
- Chat workspace code retained for future activation
- Accessible: `aria-label="Coming Soon - AI Workspace not yet publicly available"`, keyboard focus, role="status" feedback

## Jobs CEO block
- File: `src/app/(marketing)/jobs/jobs-client.tsx`
- Desktop: `lg:grid-cols-2` — image left (~50%), solid glass content panel right
- Content panel: `bg-[rgba(10,15,30,0.94)]` + `backdrop-blur-xl` + border — high contrast, no text-over-busy-image
- Mobile: stacked image then content
- Sections: Executive Appointment eyebrow, title, description, Ideal Profile, Location, Terms callout, 90-Day Ownership Goals rows, Apply CTA
- CTA **Apply for CEO Seat** still calls `goApply("ceo")`

## Global surfaces
- Navbar scrolled state uses `.glass-nav`
- Marketing layout ambient glow layers (primary/accent soft blurs)
- Director job cards use border + backdrop-blur + gradient surfaces

## Middleware (public paths)
Public marketing routes include:
`/about`, `/services`, `/industries`, `/products`, `/work`, `/packages`, `/blog`, `/resources`, `/careers`, `/jobs`, `/press`, `/investors`, `/contact`, `/book-consultation`, `/free-demo`, `/discovery`, `/checklist`, `/support`, `/search`, `/ai`, `/ai-assistant`, `/privacy`, `/terms`, `/refund-policy`, `/cookie-policy`, `/accessibility`, `/certifications`, `/expertise`, `/booking`, `/proposal`

Critical fix: `/jobs` was missing → 307 to login. Restored as public.

## Accessibility / performance
- Visible focus states on Coming Soon + CEO Apply
- Glass fallback without backdrop-filter
- No full-viewport backdrop-filter on every surface
- Reduced motion respected where card transitions exist

## Verification notes
- Production probes: `/` 200, `/ai` 200; `/jobs` was 307 (fixed in this commit)
- No invented business content
- Secure resource / admin architecture unchanged
