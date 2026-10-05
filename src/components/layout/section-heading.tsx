import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-3 mb-10 sm:mb-14",
        align === "center" && "text-center max-w-3xl mx-auto",
        className
      )}
    >
      {badge && (
        <div
          className={cn(
            "lit-eyebrow",
            align === "center" && "mx-auto"
          )}
        >
          {badge}
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.15]">
        {title}
      </h2>

      {subtitle && (
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
