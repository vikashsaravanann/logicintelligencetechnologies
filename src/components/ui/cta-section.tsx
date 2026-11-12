import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  className?: string;
}

export default function CTASection({
  title = "Ready to Build Your System?",
  subtitle = "Explore our transparent pricing tiers or request a zero-obligation working prototype.",
  primaryCta = {
    label: "View Packages",
    href: "/packages",
  },
  secondaryCta = {
    label: "Request Free Demo",
    href: "/free-demo",
  },
  className = "",
}: CTASectionProps) {
  return (
    <section className={`relative bg-white px-3 py-6 sm:px-5 sm:py-8 md:px-7 md:py-10 ${className}`}>
      <div className="relative z-10 w-full">
        <div className="relative mx-auto w-full overflow-hidden rounded-[2rem] border border-[#ddd7ed] bg-gradient-to-br from-[#f1eafb] via-[#efedf8] to-[#e8f3fc] px-6 py-14 text-center sm:px-10 sm:py-16 md:px-16 md:py-20">
          <div className="relative z-10 mx-auto max-w-6xl">
            <h2 className="mb-6 break-words text-[clamp(2.1rem,5.4vw,4.75rem)] font-bold leading-[1.04] tracking-[-.045em] text-[#171827]">
              {title}
            </h2>

            <p className="mx-auto mb-8 max-w-4xl text-base leading-relaxed text-[#39445a] sm:text-lg md:text-xl">
              {subtitle}
            </p>

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={primaryCta.href}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#263247] sm:w-auto"
              >
                <span>{primaryCta.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              {secondaryCta && (
                secondaryCta.isExternal ? (
                  <a
                    href={secondaryCta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#222b3a]/25 bg-white/50 px-6 py-3 text-sm font-semibold text-[#1b2435] transition hover:bg-white/80 sm:w-auto"
                  >
                    {secondaryCta.label}
                  </a>
                ) : (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#222b3a]/25 bg-white/50 px-6 py-3 text-sm font-semibold text-[#1b2435] transition hover:bg-white/80 sm:w-auto"
                  >
                    {secondaryCta.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
