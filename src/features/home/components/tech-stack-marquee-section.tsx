"use client";

export default function TechStackMarqueeSection() {
  const technologies = [
    "React", "Node.js", "MongoDB", "PostgreSQL", "Next.js", "TypeScript", 
    "AWS", "Vercel", "Tailwind CSS", "Flutter", "Figma", "Docker", "Python"
  ];

  return (
    <section className="py-12 bg-[#060B18] border-y border-white/5 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-8 text-center">
        <p className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-400">Trusted Technologies & Partner Stack</p>
      </div>
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex gap-8 md:gap-16 py-4 items-center">
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <span key={i} className="text-2xl font-black text-zinc-800 hover:text-white transition-colors cursor-default select-none">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
