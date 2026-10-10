# Corporate Design System Specification
## Logic Intelligence Technologies (Adapted from Healthcare Design Standard)

### 1. Color System & Design Tokens
```css
:root {
  /* Core Foundation & Neutral Canvases */
  --lit-white: #FFFFFF;
  --lit-cloud: #F7F9FC;
  --lit-navy: #0B2545;
  --lit-ink: #121826;

  /* Pastel Accent Canvases & Card Fills */
  --lit-light-purple: #F1ECFF;
  --lit-soft-lilac: #EDE7F6;
  --lit-light-pink: #FCEAF3;
  --lit-light-red: #FDE9E7;
  --lit-light-gold: #FFF4D9;
  --lit-light-blue: #E7F3FF;
  --lit-light-teal: #F0FDFA;

  /* Corporate Brand Accents */
  --lit-teal: #1FA9A2;
  --lit-cyan: #45D9D2;
  --lit-blue: #1565C0;

  /* Structural Borders & Typography Colors */
  --lit-border-light: #DFE7EF;
  --lit-text-muted: #52677C;
  --lit-text-secondary: #334155;
  --lit-shadow-card: 0 16px 40px rgba(15, 23, 42, 0.05);
}
```

### 2. Typography Rules
- **Primary UI & Headings**: Poppins (Weights: 400, 500, 600, 700).
- **Editorial Taglines & Accents**: Lora Italic (400, 500, 600).
- **Diagnostics, Code & Latency Indicators**: JetBrains Mono (400, 500, 600).
- **Scale**:
  - Hero Desktop: `clamp(2.5rem, 4.5vw, 4.25rem)` with `tracking-[-0.035em]`.
  - Section Title: `clamp(1.75rem, 3vw, 2.65rem)` with `font-bold`.
  - Card Title: `18px–22px` with `font-semibold`.
  - Body Text: `16px–18px` with `line-height: 1.7`.
  - Labels & Eyebrows: `11px–13px`, uppercase, `letter-spacing: 0.12em`.

### 3. Layout, Spacing & Container Architecture
- **Marketing Container**: `max-w-[1248px]` with `px-4 sm:px-6 lg:px-8` horizontal gutters.
- **Section Spacing**: `py-20 lg:py-28` for public marketing pages.
- **Card Padding**: `p-6 sm:p-8`, with radius `rounded-2xl` (`16px–20px`).
- **Card Borders**: `1px solid var(--lit-border-light)` (`#DFE7EF`), clean opaque white or soft pastel backgrounds.
- **Grids**: Responsive 1-col (mobile) -> 2-col (tablet) -> 3/4-col (desktop).
- **Buttons**:
  - Primary: Gradient `#0284C7` to `#1565C0` or `#1FA9A2` to `#45D9D2`, min-height 48px, rounded 10px-12px.
  - Secondary: Crisp white surface, 1px `#DFE7EF` border, dark ink text, subtle hover lift.
  - Subtle Ghost: Transparent, hover `#F1F5F9`.

### 4. Background Canvas System
- **White Canvas**: Pristine `#FFFFFF` surface with hairline dividers.
- **Cloud Canvas**: `#F7F9FC` calm neutral background.
- **Lavender Canvas**: Soft gradient `from-white via-[#F5F3FF] to-white`.
- **Blue Canvas**: Soft clinical sky `from-white via-[#F0F9FF] to-white`.
- **Gold Canvas**: Warm amber glow `from-white via-[#FFFBEB] to-white`.
- **Navy Canvas**: `#0B2545` deep contrast background with crisp white typography.
