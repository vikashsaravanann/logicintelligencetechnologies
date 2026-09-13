import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RelatedItem {
  title: string;
  description: string;
  href: string;
  category?: string;
  icon?: React.ReactNode;
}

export interface RelatedContentProps {
  title?: string;
  subtitle?: string;
  items: RelatedItem[];
  className?: string;
}

export function RelatedContent({
  title = "Related Capabilities & Solutions",
  subtitle = "Explore connected technical architectures and enterprise service models.",
  items,
  className,
}: RelatedContentProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className={cn("py-16 border-t border-white/[0.08]", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {item.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                    {item.category}
                  </span>
                )}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white">
                <span>Explore Solution</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 text-cyan-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RelatedContent;
