"use client";

import { motion } from "framer-motion";
import { Star, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { testimonials } from "@/data/testimonialsData";

export default function TestimonialsSection() {
  const hasTestimonials = testimonials.length > 0;

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 bg-white border-b border-[#E2E8F0] relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--lit-light-purple)] border border-[var(--lit-soft-lilac)] text-[#6B21A8] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
            Client Verification &amp; Engagement
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--lit-ink)] mb-4 tracking-tight">
            Client Perspectives &amp; Verification
          </h2>

          <p className="font-serif italic text-[var(--lit-blue)] text-lg mb-3">
            &ldquo;Tested architectures delivering measurable outcomes.&rdquo;
          </p>

          {hasTestimonials && (
            <p className="text-[var(--lit-text-muted)] max-w-2xl mx-auto text-base">
              Verified feedback from organizations powered by Logic Intelligence Technologies architectures.
            </p>
          )}
        </div>

        {hasTestimonials ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.figure
                key={t.id}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 flex flex-col justify-between shadow-sm transition-all hover:shadow-xl hover:border-[#CBD5E1]"
              >
                <div>
                  {t.rating && (
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < t.rating! ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <blockquote className="text-[var(--lit-ink)] leading-relaxed text-sm sm:text-[15px]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-6 pt-5 border-t border-[#E2E8F0]">
                  <p className="text-[var(--lit-ink)] font-display font-bold text-sm">{t.name}</p>
                  <p className="text-[var(--lit-text-muted)] text-xs mt-0.5">
                    {t.role}, {t.company}
                  </p>
                  {t.projectSlug && (
                    <Link
                      href={`/work/${t.projectSlug}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-mono font-bold text-[var(--lit-blue)] hover:underline"
                    >
                      Case Study Specs <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="rounded-3xl border border-[#BFDBFE] bg-gradient-to-br from-[#F0F7FF] via-[#FAFBFF] to-white p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-[var(--lit-light-blue)] border border-[#BFDBFE] flex items-center justify-center mx-auto mb-6 text-[var(--lit-blue)] shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-bold text-[var(--lit-ink)] mb-3">
                Partner as a Founding Enterprise Client
              </h3>

              <p className="text-[var(--lit-text-muted)] leading-relaxed text-sm sm:text-base max-w-xl mx-auto mb-8">
                Experience our risk-free engineering commitment: request a functioning interactive prototype demonstration tailored to your exact business workflows before committing any budget.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/free-demo"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[var(--lit-blue)] to-[var(--lit-teal)] px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white shadow-md hover:shadow-lg transition-all"
                >
                  Request Free Prototype Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[var(--lit-ink)] hover:bg-[#F8FAFC] shadow-sm transition-all"
                >
                  Contact Systems Engineering
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
