# Brand & Design System Specifications

**Company:** Logic Intelligence Technologies  
**Visual Identity:** High-precision corporate technology platform, dark theme baseline (`#050814` / `#0A0F1E`), cyan/sky accents (`#00BFFF`, `#38BDF8`), restrained micro-interactions.

---

## 1. Color Palette

- **Background Canvas:** `#050814` (Deep obsidian navy)
- **Secondary Surfaces:** `#0A0F1E` / `rgba(255, 255, 255, 0.04)`
- **Primary Accent:** Cyan `#00BFFF` (Buttons, highlights, active navigation indicators)
- **Text Primary:** `#FFFFFF`
- **Text Muted:** `#94A3B8` (Zinc-400) / `#64748B` (Zinc-500)
- **Borders:** `rgba(255, 255, 255, 0.10)` to `rgba(255, 255, 255, 0.18)`

---

## 2. Typography

- **Headings / Display:** Outfit (Google Fonts, geometric sans-serif with technical weight)
- **Body & Code:** Inter / System UI, Monospace for tokens and hashes

---

## 3. Glassmorphism System (`<GlassSurface />`)

To ensure premium aesthetics without sacrificing performance or accessibility:
1. **Backdrop Blur:** 18px–28px with 140% saturation filter.
2. **WebKit Fallbacks:** `-webkit-backdrop-filter` is paired with standard `backdrop-filter`.
3. **Solid Background Fallback:** High-opacity solid backgrounds (`rgba(10, 15, 30, 0.96)`) ensure readability in environments without backdrop filter support.
4. **Accessible Contrast:** Text on glass surfaces meets WCAG 2.1 AA 4.5:1 contrast standards.

---

## 4. Reusable Layout Primitives

- `PageShell`: Master page container with ambient glow backgrounds and `RouteAnnouncer`.
- `PageHeader`: Standardized hero section with breadcrumb integration, back navigation, badge, and H1.
- `PageSection`: Responsive vertical rhythm (`py-16` / `py-24`) and container sizing.
- `ContentContainer`: Unified horizontal padding (`px-4 sm:px-6 lg:px-8`) and max-width boundaries.
- `SectionHeading`: Standardized section header with badge, H2, and lead paragraph.
- `FinalCTA`: High-impact consultation scheduling banner.
- `BackButton`: Context-aware back navigation pill.
