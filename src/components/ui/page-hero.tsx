import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeroProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: React.ReactNode;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
  visual?: React.ReactNode;
  children?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}

export default function PageHero({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  primaryCta,
  secondaryCta,
  breadcrumbs,
  visual,
  children,
  align = "left",
  className = "",
}: PageHeroProps) {
  const isCentered = align === "center";

  return (
    <section className={`relative pt-28 md:pt-36 pb-14 md:pb-20 overflow-hidden border-b border-white/[0.06] ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#45D9D2]/50 to-transparent"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className={`flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium ${isCentered ? "justify-center" : ""}`}>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-hidden />
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-primary font-semibold" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={`grid ${visual ? "lg:grid-cols-12 gap-10 lg:gap-12 items-center" : "grid-cols-1"}`}>
          <div className={`lit-rise ${visual ? "lg:col-span-7" : ""} ${isCentered ? "text-center max-w-3xl mx-auto" : "text-left"}`}>
            {eyebrow && (
              <div className="lit-eyebrow mb-6">
                {eyebrowIcon}
                <span>{eyebrow}</span>
              </div>
            )}

            <h1 className="uppercase text-[clamp(1.875rem,1.2rem+3.2vw,3.75rem)] font-bold text-white tracking-tight leading-[1.08] mb-6 break-words">
              {title}
            </h1>

            <p className={`text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mb-8 ${isCentered ? "mx-auto" : ""}`}>
              {description}
            </p>

            {(primaryCta || secondaryCta) && (
              <div className={`flex flex-wrap gap-3 sm:gap-4 ${isCentered ? "justify-center" : "justify-start"}`}>
                {primaryCta && (
                  <Button asChild size="lg">
                    <Link href={primaryCta.href} className="group">
                      <span>{primaryCta.label}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button asChild size="lg" variant="secondary">
                    {secondaryCta.isExternal ? (
                      <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer">
                        {secondaryCta.label}
                      </a>
                    ) : (
                      <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                    )}
                  </Button>
                )}
              </div>
            )}

            {children}
          </div>

          {visual && (
            <div className="lg:col-span-5 flex justify-center lg:justify-end lit-rise lit-rise-2">
              <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 bg-[#0A1530]/70 shadow-[0_24px_60px_-24px_rgba(2,8,24,0.8)]">
                {visual}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
