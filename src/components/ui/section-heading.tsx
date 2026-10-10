import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowColor?: "purple" | "blue" | "teal" | "green" | "gold" | "coral";
  title: React.ReactNode;
  accentLine?: string;
  description?: string;
  align?: "left" | "center" | "right";
  light?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  eyebrowColor = "blue",
  title,
  accentLine,
  description,
  align = "left",
  light = false,
  className,
}: SectionHeadingProps) {
  const eyebrowStyles = {
    purple: "lit-eyebrow-pill-purple",
    blue: "lit-eyebrow-pill-blue",
    teal: "lit-eyebrow-pill-teal",
    green: "lit-eyebrow-pill-green",
    gold: "lit-eyebrow-pill-gold",
    coral: "lit-eyebrow-pill-coral",
  };

  const alignStyles = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div
      className={cn(
        "flex flex-col max-w-[780px] mb-12",
        alignStyles[align],
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "lit-eyebrow-pill mb-4 w-fit",
            eyebrowStyles[eyebrowColor]
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2]",
          light ? "text-white" : "text-[#121826]"
        )}
      >
        {title}
      </h2>
      {accentLine && (
        <p
          className={cn(
            "lit-editorial-quote text-lg sm:text-xl mt-2 mb-1",
            light ? "text-[#45D9D2]" : "text-[#1565C0]"
          )}
        >
          {accentLine}
        </p>
      )}
      {description && (
        <p
          className={cn(
            "text-base sm:text-lg mt-4 leading-relaxed",
            light ? "text-[#C2D3E5]" : "text-[#52677C]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
