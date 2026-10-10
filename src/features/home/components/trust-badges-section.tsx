"use client";

import { Clock, Code2, Rocket, Presentation, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TrustBadgesSection() {
  const trustElements = [
    {
      icon: Code2,
      title: "Full-Stack Architecture",
      desc: "Engineered with Next.js App Router, TypeScript, and hardened backends.",
      accent: "text-[var(--lit-blue)]",
      bg: "bg-[var(--lit-light-blue)]",
      border: "border-[#BFDBFE]",
    },
    {
      icon: Clock,
      title: "24h Engineering Response",
      desc: "Committed communication directly with systems engineering within 24 hours.",
      accent: "text-[#D97706]",
      bg: "bg-[var(--lit-light-gold)]",
      border: "border-[#FDE68A]",
    },
    {
      icon: Rocket,
      title: "Deterministic Milestones",
      desc: "Transparent scope, daily development updates, and zero unexpected charges.",
      accent: "text-[#7C3AED]",
      bg: "bg-[var(--lit-light-purple)]",
      border: "border-[#DDD6FE]",
    },
    {
      icon: Presentation,
      title: "Free Prototype Demo",
      desc: "Review your functional system architecture before financial commitment.",
      accent: "text-[var(--lit-teal)]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
      isLink: true,
      href: "/free-demo",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-[#E2E8F0] relative z-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustElements.map((item, i) => {
            const content = (
              <>
                <div
                  className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center shrink-0 ${item.accent} mb-4 transition-transform group-hover:scale-105`}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-display font-bold text-[var(--lit-ink)] mb-1.5">{item.title}</h3>
                <p className="text-xs text-[var(--lit-text-muted)] font-medium leading-relaxed">{item.desc}</p>
              </>
            );

            const containerClass =
              "group flex flex-col p-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] transition-all duration-300 h-full text-left shadow-sm hover:shadow-md";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08 }}
                className="h-full"
              >
                {item.isLink ? (
                  <Link
                    href={item.href!}
                    className={`${containerClass} ring-1 ring-[var(--lit-teal)]/30 hover:ring-[var(--lit-teal)]/60 bg-[#F0FDFA]`}
                  >
                    {content}
                    <div className="mt-4 text-xs font-mono font-bold text-[var(--lit-teal)] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                      Claim Free Prototype Demo <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ) : (
                  <div className={containerClass}>{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
