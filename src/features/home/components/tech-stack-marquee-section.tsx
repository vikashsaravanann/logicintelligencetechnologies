"use client";

export default function TechStackMarqueeSection() {
  const technologies = [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "Python 3.12",
    "FastAPI",
    "PostgreSQL",
    "Supabase",
    "Playwright",
    "Docker",
    "Vercel Edge",
    "AWS",
    "Framer Motion",
  ];

  return (
    <section className="py-12 bg-white border-b border-[#E2E8F0] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-6 text-center">
        <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--lit-text-muted)]">
          Core Production Technology Stack
        </p>
      </div>
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex gap-10 md:gap-16 py-3 items-center">
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <span
              key={i}
              className="text-xl sm:text-2xl font-display font-semibold tracking-wide text-slate-400 hover:text-[var(--lit-blue)] transition-colors cursor-default select-none"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
