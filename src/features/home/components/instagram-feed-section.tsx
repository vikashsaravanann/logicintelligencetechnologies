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
    caption: "How we work — our process from idea to launch 🚀",
    href: COMPANY.instagramUrl,
  },
  {
    image: "/instagram-post2.webp",
    caption: "Behind the scenes at Logic Intelligence Technologies ✨",
    href: COMPANY.instagramUrl,
  },
];

export default function InstagramFeedSection() {
  return (
    <section className="py-16 md:py-24 bg-[#060B18]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 mb-5 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <InstagramIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">Follow Our Journey</h2>
          <a
            href={COMPANY.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1.5"
          >
            @logicintelligencetechnologies
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        {/* Grid of posts */}
        <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
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
              className="group relative aspect-[4/5] rounded-2xl border border-white/10 overflow-hidden bg-black shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:border-pink-500/30 transition-all duration-300"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium leading-snug line-clamp-3">
                  {post.caption}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-pink-400 text-xs font-semibold">
                  View on Instagram <ExternalLink className="w-3 h-3" />
                </span>
              </div>

              {/* Instagram badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shadow-md opacity-80 group-hover:opacity-100 transition-opacity">
                <InstagramIcon className="w-4 h-4 text-white" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <a
            href={COMPANY.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white border border-white/10 bg-white/5 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-500/30 transition-all duration-300"
          >
            <InstagramIcon className="w-4 h-4" />
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
