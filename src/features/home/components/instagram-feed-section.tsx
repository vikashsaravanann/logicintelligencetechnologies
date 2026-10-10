"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { COMPANY } from "@/config/company";
import { ExternalLink } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const instagramPosts = [
  {
    image: "/instagram-post1.webp",
    caption: "How we work — our process from architecture blueprint to production launch.",
    href: COMPANY.instagramUrl,
  },
  {
    image: "/instagram-post2.webp",
    caption: "Behind the scenes at Logic Intelligence Technologies — engineering AI & healthcare platforms.",
    href: COMPANY.instagramUrl,
  },
];

export default function InstagramFeedSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[var(--lit-light-purple)] border border-[var(--lit-soft-lilac)] text-[#7C3AED] mb-4 shadow-sm">
            <InstagramIcon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-[var(--lit-text-muted)] mb-2 block">
            Visual Log
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--lit-ink)] mb-3 tracking-tight">
            Follow Our Development
          </h2>
          <a
            href={COMPANY.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--lit-blue)] hover:underline transition-colors text-xs font-mono uppercase tracking-widest inline-flex items-center gap-1.5 font-bold"
          >
            @logicintelligencetechnologies
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>

        {/* Grid of posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {instagramPosts.map((post, i) => (
            <motion.a
              key={i}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.12 }}
              className="group relative aspect-[4/5] rounded-2xl border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] shadow-sm hover:shadow-xl hover:border-[#CBD5E1] transition-all duration-300"
            >
              {/* Post image */}
              <div className="relative w-full h-full">
                <Image
                  src={post.image}
                  alt={post.caption}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-contain group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--lit-navy)] via-[var(--lit-navy)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <p className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                  {post.caption}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[var(--lit-cyan)] text-xs font-mono font-bold uppercase tracking-wider">
                  View on Instagram <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
