import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | React.ReactNode;
  label: string;
  description?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  accent?: "teal" | "blue" | "purple" | "gold" | "red" | "neutral";
  className?: string;
}

export function StatCard({
  value,
  label,
  description,
  trend,
  trendPositive,
  icon,
  accent = "teal",
  className,
  ...props
}: StatCardProps) {
  const accentClasses = {
    teal: "text-[var(--lit-teal)] bg-[var(--lit-light-teal)] border-[#99F6E4]",
    blue: "text-[var(--lit-blue)] bg-[var(--lit-light-blue)] border-[#BAE6FD]",
    purple: "text-[#6D28D9] bg-[var(--lit-light-purple)] border-[#DDD6FE]",
    gold: "text-[#B45309] bg-[var(--lit-light-gold)] border-[#FDE68A]",
    red: "text-[#BE123C] bg-[var(--lit-light-red)] border-[#FECDD3]",
    neutral: "text-[var(--lit-ink)] bg-slate-100 border-[#DFE7EF]",
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-[var(--lit-border-light)] bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:border-slate-300",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-transform duration-200 group-hover:scale-105",
              accentClasses[accent]
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        {trend && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
              trendPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--lit-ink)] font-sans">
          {value}
        </div>
        <p className="mt-1 text-sm font-semibold text-[var(--lit-text-secondary)]">
          {label}
        </p>
        {description && (
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--lit-text-muted)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
