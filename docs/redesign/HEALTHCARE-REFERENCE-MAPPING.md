# Healthcare Platform Reference Mapping
## Design System Translation from `lit-smart-hospital-platform` to `logicintelligencetechnologies`

### 1. Typography & Hierarchy
| Healthcare Element | Reference Implementation (`apps/landing`) | Corporate Translation (`src/app`) |
|---|---|---|
| **Headings** | Poppins 600/700, tight tracking (`-0.035em`), deep ink (`#0F172A`) | Poppins font family, `tracking-[-0.03em]`, `--lit-ink` (`#121826`) |
| **Hero Title** | 56px–64px (`line-height: 1.15; letter-spacing: -0.04em`) | `clamp(2.5rem, 5vw, 4.25rem)`, high-contrast dark ink on white/cloud, or crisp white on navy hero |
| **Editorial Slogan** | Lora italic (`.tagline`, `.accent-line`) for taglines and philosophical statements | Lora italic accents for key brand slogans and philosophical claims |
| **Body Copy** | 16px–17px (`line-height: 1.7; color: #334155`) | 16px–18px, `line-height: 1.7`, `color: var(--lit-text-muted)` (`#52677C`) or `#334155` |
| **Eyebrow Pills** | 12px pill with 1px border and light pastel fill | Pill badges with 1px border, pastel background, uppercase tracking `0.12em` |
| **Code / Diagnostics** | JetBrains Mono for system metrics, IDs, latency | JetBrains Mono for telemetry, tech tags, latency metrics, code |

### 2. Color Tokens & Surface Hierarchy
| Semantic Token | Hex / Value | Usage & Boundaries |
|---|---|---|
| `--lit-white` | `#FFFFFF` | Primary card surfaces, white canvas sections, top navigation |
| `--lit-cloud` | `#F7F9FC` | Soft serene canvas for alternating sections, dashboard workspace background |
| `--lit-navy` | `#0B2545` | High-contrast contrast hero sections, portal & admin sidebar, footer |
| `--lit-ink` | `#121826` | Deepest high-contrast text color for headings and key copy |
| `--lit-text-muted` | `#52677C` | Readable secondary copy with WCAG AA compliance |
| `--lit-border-light` | `#DFE7EF` | Crisp 1px structural borders |
| `--lit-light-purple` | `#F1ECFF` / `#F5F3FF` | Soft lilac canvas for AI strategy, company overview |
| `--lit-light-blue` | `#E7F3FF` / `#F0F9FF` | Soft clinical blue canvas for technical & architecture sections |
| `--lit-light-pink` | `#FCEAF3` / `#FFF1F2` | Subtle blush canvas for human-centered, creative topics |
| `--lit-light-gold` | `#FFF4D9` / `#FFFBEB` | Understated gold canvas for premium packages, high-tier CTAs |
| `--lit-light-red` | `#FDE9E7` | Soft danger/warning surface (used with restraint) |
| `--lit-teal` | `#1FA9A2` | Primary company identity color (restrained accents, highlights) |
| `--lit-cyan` | `#45D9D2` | Secondary identity highlight (accent glow, focus rings, hover indicators) |
| `--lit-blue` | `#1565C0` | Primary interactive link & button accent |

### 3. Surface System & Section Composition
1. **White Canvas**: `#FFFFFF` with `#DFE7EF` hairline dividers, spacious 104px vertical padding, clean opaque cards.
2. **Soft Lavender Canvas**: Soft tint from `#FFFFFF` to `#F1ECFF`, for strategic and intelligent features.
3. **Blush Canvas**: `#FCEAF3` / `#FFF1F2` for customer support, creative services, and human impact.
4. **Gold Canvas**: `#FFF4D9` / `#FFFBEB` for enterprise packages, commercial tiers, and consulting.
5. **Blue Canvas**: `#E7F3FF` / `#F0F9FF` for technology architecture, integrations, and product features.
6. **Navy Canvas**: `#0B2545` for high-impact corporate hero and contrast sections.
7. **Editorial Split Canvas**: 2-column grid (`split`) with editorial copy on the left and an elevated, multi-layered interactive preview on the right.

### 4. Admin & Client Workspace Adaptation (`workspace.css`)
- **Sidebar**: Fixed 250px `#0B2545` deep navy sidebar with `#D1DFED` links, active indicator `#1B4660` with `#45D9D2` teal left border.
- **Topbar**: 72px–88px pristine white `#FFFFFF` bar with `#DFE7EF` bottom border.
- **Workspace Canvas**: `#F3F6FA` / `#F7F9FC` cloud background with crisp white elevated data cards.
- **Tables & Modals**: Clean table rows with light borders, status chips (mint, blue, gold, coral), and accessible modals.
