"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { testimonials } from "@/data/testimonialsData";

export default function TestimonialsSection() {
  const hasTestimonials = testimonials.length > 0;

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-[#07090D] border-y border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="lit-eyebrow mb-4 block">
            Client Verification
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Client Perspectives &amp; Impact
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
                className="rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all hover:border-[#45D9D2]/30 hover:bg-[#151922]"
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
            className="max-w-2xl mx-auto"
          >
            <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="w-14 h-14 rounded-2xl bg-[#45D9D2]/10 border border-[#45D9D2]/25 flex items-center justify-center mx-auto mb-6 text-[#45D9D2]">
                <MessageSquareQuote className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">
                Partner as a Founding Client
              </h3>
              <p className="text-[#B5BECC] leading-relaxed text-sm sm:text-base max-w-lg mx-auto mb-8">
                Request a working interactive prototype demo for your product. We build the direction first before you invest.
              </p>
              <Link
                href="/free-demo"
                className="lit-btn lit-btn-primary lit-btn-lg"
              >
                Request Free Prototype Demo <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
