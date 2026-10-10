"use client";

export default function TechStackMarqueeSection() {
  const technologies = [
    "Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Python 3.12", "FastAPI",
    "PostgreSQL", "Supabase", "Playwright", "Docker", "Vercel Edge", "AWS", "Framer Motion"
  ];

  return (
    <section className="py-12 bg-[#07090D] border-y border-white/[0.08] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-6 text-center">
        <p className="text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-[#B5BECC]/70">
          Core Production Technology Stack
        </p>
      </div>
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex gap-10 md:gap-16 py-3 items-center">
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <span
              key={i}
              className="text-xl sm:text-2xl font-display font-semibold tracking-wide text-zinc-600 hover:text-[#45D9D2] transition-colors cursor-default select-none"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
