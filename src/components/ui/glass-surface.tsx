import { type ReactNode, type HTMLAttributes } from "react";

type GlassVariant =
  | "surface"
  | "strong"
  | "panel"
  | "card"
  | "nav"
  | "soft"
  | "liquid"
  | "subtle"
  | "prominent";

const VARIANT_CLASS: Record<GlassVariant, string> = {
  surface: "glass-surface",
  strong: "glass-surface-strong",
  panel: "glass-panel",
  card: "glass-card",
  nav: "glass-nav",
  soft: "bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl",
  liquid:
    "bg-white/[0.06] border border-white/[0.12] backdrop-blur-xl backdrop-saturate-150 rounded-2xl",
  subtle:
    "bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl",
  prominent:
    "bg-white/[0.08] border border-primary/30 backdrop-blur-xl backdrop-saturate-150 rounded-2xl shadow-[0_0_40px_rgba(69,217,210,0.12)]",
};

type GlassSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassVariant;
  children: ReactNode;
  as?: "div" | "section" | "article" | "aside";
};

/**
 * Central glassmorphism surface — prefer this over ad-hoc backdrop-blur classes.
 */
export function GlassSurface({
  variant = "surface",
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: GlassSurfaceProps) {
  return (
    <Tag className={`${VARIANT_CLASS[variant]} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

export default GlassSurface;
