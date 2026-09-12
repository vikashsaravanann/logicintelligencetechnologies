import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

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
    <section className={`relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden ${className}`}>
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[250px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Optional Breadcrumb trail */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className={`flex items-center gap-2 text-xs text-zinc-400 font-medium ${isCentered ? "justify-center" : ""}`}>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
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

        <div className={`grid ${visual ? "lg:grid-cols-12 gap-12 items-center" : "grid-cols-1"}`}>
          {/* Text Column */}
          <div className={`${visual ? "lg:col-span-7" : ""} ${isCentered ? "text-center max-w-3xl mx-auto" : "text-left"}`}>
            {eyebrow && (
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6`}>
                {eyebrowIcon}
                <span>{eyebrow}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mb-8">
              {description}
            </p>

            {(primaryCta || secondaryCta) && (
              <div className={`flex flex-wrap gap-4 ${isCentered ? "justify-center" : "justify-start"}`}>
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="px-7 py-3.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] flex items-center gap-2 group"
                  >
                    <span>{primaryCta.label}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                {secondaryCta && (
                  secondaryCta.isExternal ? (
                    <a
                      href={secondaryCta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
                    >
                      {secondaryCta.label}
                    </a>
                  ) : (
                    <Link
                      href={secondaryCta.href}
                      className="px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
                    >
                      {secondaryCta.label}
                    </Link>
                  )
                )}
              </div>
            )}

            {children}
          </div>

          {/* Visual Column */}
          {visual && (
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-2xl shadow-primary/5">
                {visual}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
