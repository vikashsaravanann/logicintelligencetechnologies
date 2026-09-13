import React from "react";
import { cn } from "@/lib/utils";
import Breadcrumbs, { BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import BackButton from "@/components/navigation/BackButton";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  backButton?: {
    fallbackHref: string;
    label: string;
  };
  actions?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs,
  backButton,
  actions,
  align = "left",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative pt-28 sm:pt-32 pb-12 sm:pb-16 border-b border-white/[0.08]",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {backButton && (
            <BackButton
              fallbackHref={backButton.fallbackHref}
              label={backButton.label}
              inline
            />
          )}
        </div>

        {/* Header content */}
        <div
          className={cn(
            "space-y-4",
            align === "center" && "text-center max-w-3xl mx-auto"
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

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            {title}
          </h1>

          {subtitle && (
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}

          {actions && (
            <div
              className={cn(
                "pt-4 flex flex-wrap items-center gap-4",
                align === "center" && "justify-center"
              )}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
