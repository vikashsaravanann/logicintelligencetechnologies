import React from "react";
import Link from "next/link";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  color?: "purple" | "blue" | "teal" | "green" | "gold" | "coral";
  href?: string;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  badge,
  color = "blue",
  href,
  className,
}: FeatureCardProps) {
  const colorMap = {
    purple: {
      bg: "bg-[#F5F3FF]",
      border: "border-[#DDD6FE]",
      text: "text-[#6D28D9]",
      hoverBorder: "hover:border-[#7C3AED]",
    },
    blue: {
      bg: "bg-[#F0F9FF]",
      border: "border-[#BAE6FD]",
      text: "text-[#0369A1]",
      hoverBorder: "hover:border-[#0284C7]",
    },
    teal: {
      bg: "bg-[#F0FDFA]",
      border: "border-[#99F6E4]",
      text: "text-[#0F766E]",
      hoverBorder: "hover:border-[#1FA9A2]",
    },
    green: {
      bg: "bg-[#F0FDF4]",
      border: "border-[#BBF7D0]",
      text: "text-[#15803D]",
      hoverBorder: "hover:border-[#16A34A]",
    },
    gold: {
      bg: "bg-[#FFFBEB]",
      border: "border-[#FDE68A]",
      text: "text-[#B45309]",
      hoverBorder: "hover:border-[#D97706]",
    },
    coral: {
      bg: "bg-[#FFF1F2]",
      border: "border-[#FECDD3]",
      text: "text-[#BE123C]",
      hoverBorder: "hover:border-[#E11D48]",
    },
  };

  const scheme = colorMap[color];

  const content = (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white border border-[#DFE7EF] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.06)]",
        scheme.hoverBorder,
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-6">
          {Icon && (
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105",
                scheme.bg,
                scheme.border,
                scheme.text
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
          )}
          {badge && (
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider",
                scheme.bg,
                scheme.border,
                scheme.text
              )}
            >
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#121826] mb-3 group-hover:text-[#1565C0] transition-colors">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-[#52677C] leading-relaxed">
          {description}
        </p>
      </div>

      {href && (
        <div className="mt-6 pt-4 border-t border-[#DFE7EF]/60 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1565C0] group-hover:text-[#0B2545] transition-colors">
          <span>Explore</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default FeatureCard;
