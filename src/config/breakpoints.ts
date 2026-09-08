/** Canonical layout breakpoints (px). Keep in sync with @theme --breakpoint-* in globals.css. */
export const BREAKPOINTS = {
  xs: 390,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const MQ = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  "2xl": `(min-width: ${BREAKPOINTS["2xl"]}px)`,
  phone: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  touch: "(hover: none) and (pointer: coarse)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
} as const;
