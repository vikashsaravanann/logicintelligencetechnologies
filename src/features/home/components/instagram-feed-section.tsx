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
    <section className="py-20 md:py-28 bg-[#07090D] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#10131A] border border-white/10 text-[#45D9D2] mb-5 shadow-[0_0_20px_rgba(69,217,210,0.15)]">
            <InstagramIcon className="w-5 h-5" />
          </div>
          <span className="lit-eyebrow mb-3 block">Visual Log</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-3 uppercase tracking-tight">
            Follow Our Development
          </h2>
          <a
            href={COMPANY.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B5BECC] hover:text-[#45D9D2] transition-colors text-xs font-mono uppercase tracking-widest inline-flex items-center gap-1.5"
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
              className="group relative aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden bg-[#10131A] shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:border-[#45D9D2]/40 transition-all duration-300"
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <p className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                  {post.caption}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[#45D9D2] text-xs font-mono font-bold uppercase tracking-wider">
                  View on Instagram <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Instagram badge */}
              <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-[#10131A]/90 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:text-[#45D9D2] group-hover:border-[#45D9D2]/30 transition-all">
                <InstagramIcon className="w-4 h-4" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.25 }}
          className="text-center mt-12"
        >
          <a
            href={COMPANY.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lit-btn lit-btn--secondary lit-btn-md"
          >
            <InstagramIcon className="w-4 h-4 mr-2" />
            Connect on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
