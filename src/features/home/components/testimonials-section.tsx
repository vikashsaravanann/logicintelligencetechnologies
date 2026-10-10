"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Star, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";
import { testimonials } from "@/data/testimonialsData";

export default function TestimonialsSection() {
  const hasTestimonials = testimonials.length > 0;

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 bg-[#07090D] border-y border-white/[0.08] relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10131A] border border-[#45D9D2]/30 text-[#45D9D2] text-[11px] font-mono uppercase tracking-[0.18em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45D9D2]" />
            Client Verification &amp; Engagement
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Client Perspectives &amp; Verification
          </h2>
          {hasTestimonials && (
            <p className="text-[#B5BECC] max-w-2xl mx-auto text-base">
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
                className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#45D9D2]/40 hover:bg-[#131722]"
              >
                <div>
                  {t.rating && (
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < t.rating! ? "fill-[#45D9D2] text-[#45D9D2]" : "text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <blockquote className="text-zinc-300 leading-relaxed text-sm sm:text-[15px]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-white font-display font-bold text-sm">{t.name}</p>
                  <p className="text-[#B5BECC] text-xs mt-0.5">
                    {t.role}, {t.company}
                  </p>
                  {t.projectSlug && (
                    <Link
                      href={`/work/${t.projectSlug}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-mono font-bold text-[#45D9D2] hover:underline"
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
            <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-8 sm:p-12 text-center shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(69,217,210,0.1),transparent_70%)]"
                aria-hidden
              />

              <div className="w-14 h-14 rounded-2xl bg-[#45D9D2]/10 border border-[#45D9D2]/25 flex items-center justify-center mx-auto mb-6 text-[#45D9D2] relative z-10 shadow-[0_0_20px_rgba(69,217,210,0.15)]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3 relative z-10">
                Partner as a Founding Enterprise Client
              </h3>
              
              <p className="text-[#B5BECC] leading-relaxed text-sm sm:text-base max-w-xl mx-auto mb-8 relative z-10">
                Experience our risk-free engineering commitment: request a functioning interactive prototype demonstration tailored to your exact business workflows before committing any budget.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link
                  href="/free-demo"
                  className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-xl bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#07090D] shadow-[0_0_25px_rgba(69,217,210,0.3)] transition-all hover:brightness-110"
                >
                  <span>Request Free Prototype Demo</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-xl border border-white/15 bg-[#141923] px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white transition-all hover:border-[#45D9D2]/40 hover:bg-[#181f2c]"
                >
                  <span>Book Technical Scoping Slot</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
