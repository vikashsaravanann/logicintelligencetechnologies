import React from "react";
import { cn } from "@/lib/utils";

export type SurfaceVariant =
  | "white"
  | "cloud"
  | "lavender"
  | "blush"
  | "gold"
  | "blue"
  | "navy";

interface BackgroundSurfaceProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: SurfaceVariant;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function BackgroundSurface({
  as: Component = "section",
  variant = "white",
  children,
  className,
  id,
  ...props
}: BackgroundSurfaceProps) {
  const surfaceClasses: Record<SurfaceVariant, string> = {
    white: "canvas-white",
    cloud: "canvas-cloud",
    lavender: "canvas-lavender",
    blush: "canvas-blush",
    gold: "canvas-gold",
    blue: "canvas-blue",
    navy: "canvas-navy",
  };

  return (
    <Component
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-24 relative overflow-hidden transition-colors",
        surfaceClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default BackgroundSurface;
