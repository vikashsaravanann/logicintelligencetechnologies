# Web Performance Optimization — Logic Intelligence Technologies

**Date:** 2026-09-15  
**Commit focus:** LCP, image weight, caching, font, bundle imports

## Changes

1. **Next.js Image Optimization re-enabled**
   - Removed `images.unoptimized: true` (served original multi‑MB files).
   - Formats: AVIF + WebP.
   - Sized breakpoints for marketing cards and heroes.
   - `minimumCacheTTL` 30 days for optimized images.

2. **Static asset Cache-Control**
   - Long-cache headers for `/assets/*`, `/images/*`, and common image/font extensions.

3. **Font loading**
   - `next/font` Inter with `display: 'swap'`, `preload: true`, `adjustFontFallback: true`.

4. **Bundle**
   - `optimizePackageImports` for `lucide-react`, `framer-motion`, `recharts`.
   - Production `removeConsole` (keep error/warn).

5. **Asset weight**
   - Compressed oversized JPGs/PNGs (Instagram posts ~5.8MB → ~90KB; logo.png ~4.4MB → ~216KB; work/package/resource images capped ~200KB).

## Not claimed without Lighthouse

- Field LCP / INP / CLS numbers (run after deploy in PageSpeed Insights).
- Full client-component tree-shaking audit.

## How to verify

```bash
# Local after install
npm run build

# Production
# PageSpeed Insights → https://www.logicintelligencetechnologies.in/
# Confirm /_next/image responses and Cache-Control on /images/*
```
