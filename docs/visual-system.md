# LIT visual system

Status: IMPLEMENTED (tokens + primitives). Page-by-page photography REQUIRES COMPANY ASSET where a real photo is needed.

## Design tokens

Defined in `src/app/globals.css`:

- Color: `--bg-primary` `#0A0F1E`, `--neon-blue` `#00BFFF`, `--neon-purple` `#7B2FBE`
- Radius: `--radius-sm` 8 / `--radius-md` 12 / `--radius-lg` 16 / `--radius-xl` 20
- Spacing: `--space-1` … `--space-11` (4–120px)
- Motion: `--transition-fast|smooth|slow` + `prefers-reduced-motion` kill-switch

## Primitives

| Component | Path |
| --- | --- |
| PageHero | `src/components/ui/page-hero.tsx` |
| PageBackdrop | `src/components/ui/page-backdrop.tsx` |
| BrandMesh | `src/components/ui/brand-mesh.tsx` |
| ImageFeature | `src/components/ui/image-feature.tsx` |
| SafeImage | `src/components/ui/safe-image.tsx` |
| Visual map | `src/lib/visuals/page-visuals.ts` |

## Rules

- No fabricated people, clients, awards, or metrics.
- Service cards use `/images/services/{slug}.svg` already in repo.
- Blog/resource/package/industry covers already exist as unique SVGs.
- Work photos remain the licensed set under `/images/work/`.
- Founder photo is the existing `/assets/founder.jpg` only.

## Manual assets still needed

- Additional OG photography if you want photo OG instead of `/api/og`.
- PDF covers for resources you have not uploaded yet.
