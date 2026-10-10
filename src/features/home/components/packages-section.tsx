"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { packagesData } from "@/data/packagesData";

/**
 * Packages grid — CSS-only reveal (no heavy whileInView) to keep INP low.
 */
export default function PackagesSection() {
  return (
    <section
      id="packages"
      className="py-20 md:py-28 bg-transparent relative border-t border-white/[0.08]"
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#45D9D2]/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="lit-eyebrow mb-4 block">Engineered Packages</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-5 uppercase tracking-tight">
            Transparent Pricing.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
              Deterministic Value.
            </span>
          </h2>
          <p className="text-[#B5BECC] text-base sm:text-lg">
            Fixed scope, verifiable milestones, zero hidden costs, and free prototype demonstration prior to payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {packagesData.map((pkg) => {
            const isPopular = pkg.slug === "business-pro-pack";
            return (
              <div
                key={pkg.slug}
                className={`relative rounded-2xl p-7 sm:p-8 flex flex-col h-full bg-[#10131A] border transition-all duration-300 hover:-translate-y-1 ${
                  isPopular
                    ? "border-[#45D9D2]/40 shadow-[0_10px_40px_rgba(69,217,210,0.15)] bg-[#151922]"
                    : "border-white/10 hover:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#07090D] bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] shadow-[0_0_15px_rgba(69,217,210,0.4)]">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">{pkg.title}</h3>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#B5BECC] mb-4">Starting investment</p>
                  <div className="mb-6">
                    <span
                      className={`text-3xl sm:text-4xl font-display font-bold ${
                        isPopular
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-[#45D9D2]"
                          : "text-white"
                      }`}
                    >
                      {pkg.price}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#B5BECC] bg-[#07090D] p-3 rounded-xl border border-white/5">
                    <span className="text-[#45D9D2] font-mono uppercase tracking-wider font-bold block mb-1">Target Persona:</span>
                    {pkg.bestFor}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.inclusions.slice(0, 6).map((f) => (
                    <li
                      key={f.title}
                      className="flex gap-3 items-start text-xs sm:text-sm text-zinc-300 leading-relaxed"
                    >
                      <Check className="h-4 w-4 shrink-0 text-[#45D9D2] mt-0.5" aria-hidden />
                      <span>{f.title}</span>
                    </li>
                  ))}
                  {pkg.inclusions.length > 6 && (
                    <li className="text-xs font-mono text-[#45D9D2] font-semibold pl-7">
                      + {pkg.inclusions.length - 6} additional architecture features
                    </li>
                  )}
                </ul>

                <Link
                  href={`/packages/${pkg.slug}`}
                  className={`flex items-center justify-center w-full py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                    isPopular
                      ? "bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] text-[#07090D] hover:brightness-110 shadow-[0_0_20px_rgba(69,217,210,0.3)]"
                      : "bg-[#151922] text-white border border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span>Package Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center max-w-2xl mx-auto p-6 rounded-2xl border border-[#45D9D2]/20 bg-[#10131A] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <p className="text-zinc-300 text-sm leading-relaxed">
            Need customized enterprise architecture or proprietary AI integration?{" "}
            <a
              href="https://wa.me/917550067712?text=Hi%20LIT%20—%20I%20need%20help%20choosing%20a%20package"
              className="inline-flex items-center gap-1.5 px-3 py-1 mx-1 rounded-lg bg-[#25D366] text-[#04120a] font-bold text-xs hover:bg-[#20bd5c] transition-colors align-middle"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Founder
            </a>{" "}
            for direct technical scoping and fixed milestones.
          </p>
        </div>
      </div>
    </section>
  );
}
