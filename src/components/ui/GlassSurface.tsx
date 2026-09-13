"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "subtle" | "default" | "prominent" | "card";
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Enterprise Glassmorphism component with solid fallbacks,
 * accessible contrast, and WebKit backdrop-filter support.
 */
export function GlassSurface({
  variant = "default",
  children,
  className,
  as: Component = "div",
  ...props
}: GlassSurfaceProps) {
  const variantStyles = {
    subtle:
      "bg-[rgba(10,15,30,0.65)] border border-white/[0.08] shadow-lg backdrop-blur-md -webkit-backdrop-blur-md",
    default:
      "bg-[rgba(10,15,30,0.85)] border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-[20px] -webkit-backdrop-blur-[20px]",
    prominent:
      "bg-[rgba(15,23,42,0.92)] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[28px] -webkit-backdrop-blur-[28px]",
    card:
      "bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl -webkit-backdrop-blur-xl transition-all duration-300",
  };

  return (
    <Component
      className={cn(
        "relative rounded-2xl",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default GlassSurface;
