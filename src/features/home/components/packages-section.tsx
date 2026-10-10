"use client";

import { Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { packagesData } from "@/data/packagesData";

export default function PackagesSection() {
  return (
    <section
      id="packages"
      className="py-24 md:py-32 bg-[var(--lit-cloud)] relative border-b border-[#E2E8F0]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--lit-light-gold)] border border-[#FDE68A] text-[#92400E] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            Turnkey Engineering Packages
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--lit-ink)] mb-4 tracking-tight leading-[1.08]">
            Transparent Investments.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lit-blue)] via-[var(--lit-teal)] to-[#7C3AED]">
              Deterministic Value.
            </span>
          </h2>

          <p className="font-serif italic text-[var(--lit-blue)] text-lg mb-3">
            &ldquo;Fixed scope. Zero hidden fees. Free prototype demonstration.&rdquo;
          </p>

          <p className="text-[var(--lit-text-muted)] text-base sm:text-lg leading-relaxed">
            Fixed scope, verifiable milestones, zero hidden costs, and free prototype demonstration prior to payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          {packagesData.map((pkg) => {
            const isPopular = pkg.slug === "business-pro-pack";
            return (
              <div
                key={pkg.slug}
                className={`relative rounded-2xl p-7 sm:p-8 flex flex-col justify-between h-full bg-white border transition-all duration-300 hover:-translate-y-1.5 ${
                  isPopular
                    ? "border-[var(--lit-teal)] ring-2 ring-[var(--lit-teal)]/20 shadow-xl"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1] shadow-sm"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white bg-gradient-to-r from-[var(--lit-blue)] to-[var(--lit-teal)] shadow-sm">
                    Featured Tier
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-[var(--lit-ink)] mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-xs font-mono uppercase tracking-wider text-[var(--lit-text-muted)] mb-4 font-semibold">
                      Starting investment
                    </p>
                    <div className="mb-6">
                      <span className="text-3xl sm:text-4xl font-display font-bold text-[var(--lit-ink)]">
                        {pkg.price}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[var(--lit-text-muted)] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <span className="text-[var(--lit-blue)] font-mono uppercase tracking-wider font-bold block mb-1 text-[10px]">
                        Target Organization:
                      </span>
                      {pkg.bestFor}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.inclusions.slice(0, 6).map((f) => (
                      <li
                        key={f.title}
                        className="flex gap-3 items-start text-xs sm:text-sm text-[var(--lit-ink)] leading-relaxed"
                      >
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
                        <span>{f.title}</span>
                      </li>
                    ))}
                    {pkg.inclusions.length > 6 && (
                      <li className="text-xs font-mono text-[var(--lit-blue)] font-semibold pl-7">
                        + {pkg.inclusions.length - 6} additional architecture deliverables
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className={`flex items-center justify-center w-full py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                      isPopular
                        ? "bg-gradient-to-r from-[var(--lit-blue)] to-[var(--lit-teal)] text-white hover:brightness-105 shadow-md"
                        : "bg-white border border-[#CBD5E1] text-[var(--lit-ink)] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span>View Package Specifications</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-2" />
                  </Link>

                  <Link
                    href="/free-demo"
                    className="flex min-h-[38px] items-center justify-center text-xs font-mono tracking-wider uppercase text-[var(--lit-text-muted)] hover:text-[var(--lit-blue)] font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[var(--lit-teal)]" />
                    <span>Free Prototype Demo</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
