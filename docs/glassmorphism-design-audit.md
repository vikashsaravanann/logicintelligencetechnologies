# Glassmorphism Design Audit — 2026-09-17

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

## AI Coming Soon
- File: `src/app/ai/page.tsx`
- Public landing primary CTA: **Coming Soon** (was Get Started)
- Does **not** call auth, router, setLanded(false), or AI APIs
- Shows status message for AI Workspace coming soon
- Chat workspace code retained for future activation

## Jobs CEO block
- File: `src/app/(marketing)/jobs/jobs-client.tsx`
- Desktop: ~50/50 grid — image left, solid glass content panel right
- Mobile: stacked image then content
- CTA **Apply for CEO Seat** still calls `goApply("ceo")`

## Global surfaces
- Navbar scrolled state uses `.glass-nav`
- Marketing layout ambient glow layers
