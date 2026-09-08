"use client";
import { motion } from "framer-motion";
import { MessageSquareQuote, Star } from "lucide-react";
import Link from "next/link";
import { testimonials } from "@/data/testimonialsData";

export default function TestimonialsSection() {
  const hasTestimonials = testimonials.length > 0;

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-[#060B18] border-y border-white/5 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
            Client Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            What Our Clients Say
          </h2>
          {hasTestimonials && (
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Real feedback from businesses we&apos;ve built for.
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
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col"
              >
                {t.rating && (
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < t.rating! ? "fill-primary text-primary" : "text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <blockquote className="text-zinc-200 leading-relaxed text-sm flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-zinc-400 text-xs">
                    {t.role}, {t.company}
                  </p>
                  {t.projectSlug && (
                    <Link
                      href={`/work/${t.projectSlug}`}
                      className="inline-block mt-2 text-xs text-primary hover:underline"
                    >
                      View case study →
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
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-6 md:p-10 md:p-8 md:p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <MessageSquareQuote className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                Be one of our first featured clients
              </h3>
              <p className="text-zinc-400 leading-relaxed max-w-lg mx-auto">
                Start a free demo with us and get featured here as one of our founding case studies.
              </p>
              <Link
                href="/free-demo"
                className="inline-flex mt-6 px-6 py-3 rounded-xl text-sm font-bold text-black bg-primary neon-btn"
              >
                Start a free demo
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
