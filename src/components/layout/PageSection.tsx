import React from "react";
import { cn } from "@/lib/utils";

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  hasBorder?: boolean;
  containerSize?: "default" | "narrow" | "wide" | "full";
  noContainer?: boolean;
}

export function PageSection({
  children,
  className,
  hasBorder = false,
  containerSize = "default",
  noContainer = false,
  ...props
}: PageSectionProps) {
  const containerClasses = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[1600px]",
    full: "max-w-full",
  };

  return (
    <section
      className={cn(
        "py-16 sm:py-24 relative overflow-hidden",
        hasBorder && "border-b border-white/[0.08]",
        className
      )}
      {...props}
    >
      {noContainer ? (
        children
      ) : (
        <div
          className={cn(
            "w-full mx-auto px-4 sm:px-6 lg:px-8",
            containerClasses[containerSize]
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

export default PageSection;
