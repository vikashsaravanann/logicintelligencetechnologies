import { Metadata } from "next";
import { BackButton } from "@/components/navigation/back-button";
import FloatingElements from "@/components/motion/floating-elements";
import { FOUNDER } from "@/config/founder";
import {
  Code2,
  Database,
  Layout,
  Cloud,
  Bot,
  Network,
  Cpu
} from "lucide-react";

export const metadata: Metadata = {
  title: "Technical Expertise | Logic Intelligence Technologies",
  description:
    "Explore the core technical competencies, engineering capabilities, and architectural expertise at Logic Intelligence Technologies.",
  openGraph: {
    title: "Technical Expertise — Logic Intelligence Technologies",
    description:
      "A comprehensive overview of our engineering capabilities spanning AI orchestration, full-stack web development, and cloud architecture.",
    images: [
      {
        url: "/api/og?title=Technical%20Expertise&category=Logic%20Intelligence%20Technologies",
        width: 1200,
        height: 630,
        alt: "Logic Intelligence Technologies Technical Expertise",
      },
    ],
  },
};

const EXPERTISE_DOMAINS = [
  {
    title: "Automation & AI Systems",
    items: FOUNDER.expertise.automationAndAi,
    icon: Bot,
    description: "Designing headless automation systems, LLM orchestration, and computer vision pipelines."
  },
  {
    title: "Backend & API Engineering",
    items: FOUNDER.expertise.backendAndApiEngineering,
    icon: Database,
    description: "Architecting structured, offline-first backends and asynchronous data processing queues."
  },
  {
    title: "Frontend Engineering",
    items: FOUNDER.expertise.frontendEngineering,
    icon: Layout,
    description: "Developing high-performance, responsive web interfaces using modern frameworks."
  },
  {
    title: "Core Programming",
    items: FOUNDER.expertise.programmingLanguages,
    icon: Code2,
    description: "Foundational languages utilized across the entire stack for deterministic execution."
  },
  {
    title: "Cloud & Infrastructure",
    items: FOUNDER.expertise.databaseAndCloudInfrastructure,
    icon: Cloud,
    description: "Deployment, CI/CD, and scalable cloud hosting architecture."
  },
  {
    title: "Network & Systems",
    items: FOUNDER.expertise.networkAndSystems,
    icon: Network,
    description: "Physical routing limitations and network configuration for robust system topologies."
  }
];

export default function ExpertisePage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        <BackButton fallbackHref="/about" label="Back to About" inline />
      </div>
      
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 max-w-7xl mx-auto mb-16 text-center z-10">
        <span className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10">
          <Cpu className="w-4 h-4" />
          Technical Capabilities
        </span>
        <h1 className="uppercase text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
          Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Expertise</span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Our technical foundation is intentionally diverse, enabling the architecture of end-to-end applications from the network routing layer up to sophisticated AI models.
        </p>
      </section>

      {/* Competency Grid */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {EXPERTISE_DOMAINS.map((domain, index) => (
            <div 
              key={domain.title}
              className="group p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 hover:bg-white/[0.04] transition-all hover:border-primary/30 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <domain.icon className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <domain.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {domain.title}
                </h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed max-w-[90%]">
                  {domain.description}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {domain.items.map((item) => (
                    <li 
                      key={item}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 group-hover:border-primary/20 transition-colors"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
