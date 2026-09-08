"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const ITEMS = [
  {
    href: "/ai-assistant",
    image: "/assets/briefings/knowledge-assistant.jpg",
    kicker: "Product",
    title: "Knowledge Assistant",
    body: "Private RAG over your documents. Demo on /ai first.",
  },
  {
    href: "/investors",
    image: "/assets/briefings/investor-briefing.jpg",
    kicker: "Briefing",
    title: "Investor briefing",
    body: "Operating update. Not a priced round. Walk the live stack.",
  },
  {
    href: "/jobs",
    image: "/assets/founder.jpg",
    kicker: "Leadership",
    title: "Jobs — CEO / Directors",
    body: "Employment offers. Not a cheque-for-title.",
  },
] as const;

export default function BriefingButtonsSection() {
  return (
    <section
      aria-label="Briefings and product entry points"
      className="relative bg-[#0A0F1E] py-8 md:py-12 border-y border-white/5"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 sm:grid-cols-3 lg:px-8">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative isolate block h-44 overflow-hidden rounded-2xl border border-white/10 md:h-52"
          >
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/55 to-black/10" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                {item.kicker}
              </p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
                {item.title}
                <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{item.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
