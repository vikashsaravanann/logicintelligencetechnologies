import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

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
  title = "Ready to Build Your Digital Advantage?",
  subtitle = "Schedule a technical architecture review with our engineering leads or request a working prototype before payment.",
  primaryCta = {
    label: "Schedule Strategy Call",
    href: "/book-consultation",
  },
  secondaryCta = {
    label: "Request Free Demo",
    href: "/free-demo",
  },
  className = "",
}: CTASectionProps) {
  return (
    <section className={`relative py-16 md:py-24 overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl border border-[#0B2545] bg-[var(--lit-navy)] p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,169,162,0.18),transparent_55%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#45D9D2]/30 bg-[#45D9D2]/10 text-[#45D9D2] text-xs font-mono font-semibold tracking-widest uppercase mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Engineering Engagement</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight mb-6">
              {title}
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={primaryCta.href}
                className="lit-btn lit-btn-primary lit-btn-lg w-full sm:w-auto justify-center"
              >
                <span>{primaryCta.label}</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
              {secondaryCta && (
                secondaryCta.isExternal ? (
                  <a
                    href={secondaryCta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lit-btn bg-white/10 hover:bg-white/20 text-white border border-white/20 lit-btn-lg w-full sm:w-auto justify-center"
                  >
                    {secondaryCta.label}
                  </a>
                ) : (
                  <Link
                    href={secondaryCta.href}
                    className="lit-btn bg-white/10 hover:bg-white/20 text-white border border-white/20 lit-btn-lg w-full sm:w-auto justify-center"
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
