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
        <div className="relative rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-black/60 to-accent/10 p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-2xl shadow-primary/5">
          {/* Background mesh light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/40 bg-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Engineering Engagement</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {title}
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-10">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={primaryCta.href}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_25px_rgba(0,191,255,0.4)] flex items-center justify-center gap-2 group"
              >
                <span>{primaryCta.label}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {secondaryCta && (
                secondaryCta.isExternal ? (
                  <a
                    href={secondaryCta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all text-center"
                  >
                    {secondaryCta.label}
                  </a>
                ) : (
                  <Link
                    href={secondaryCta.href}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all text-center"
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
