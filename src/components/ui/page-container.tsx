import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

export function PageContainer({
  children,
  className,
  size = "default",
  ...props
}: PageContainerProps) {
  const sizeClasses = {
    narrow: "max-w-[1024px]",
    default: "max-w-[1248px]",
    wide: "max-w-[1440px]",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContainer;
