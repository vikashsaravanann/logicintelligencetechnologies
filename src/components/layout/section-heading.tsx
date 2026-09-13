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
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm",
            align === "center" && "mx-auto"
          )}
        >
          {badge}
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
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
