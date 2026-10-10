import { Metadata } from "next";
import { BackButton } from "@/components/navigation/back-button";
import FloatingElements from "@/components/motion/floating-elements";
import { FOUNDER } from "@/config/founder";
import CTASection from "@/components/ui/cta-section";
import {
  Code2,
  Database,
  Layout,
  Cloud,
  Bot,
  Network,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

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
    accent: "from-cyan-500/20 to-teal-500/10",
    borderAccent: "group-hover:border-cyan-500/40",
    description: "Designing deterministic AI architectures, headless browser automation, real-time voice intelligence, and agentic tool-use pipelines."
  },
  {
    title: "Backend & API Engineering",
    items: FOUNDER.expertise.backendAndApiEngineering,
    icon: Database,
    accent: "from-blue-500/20 to-indigo-500/10",
    borderAccent: "group-hover:border-blue-500/40",
    description: "Architecting structured, high-throughput backends, transactional PostgreSQL schemas, and low-latency asynchronous data processing pipelines."
  },
  {
    title: "Frontend Engineering",
    items: FOUNDER.expertise.frontendEngineering,
    icon: Layout,
    accent: "from-emerald-500/20 to-teal-500/10",
    borderAccent: "group-hover:border-emerald-500/40",
    description: "Engineering fluid, sub-second web interfaces with Next.js App Router, React 19, TypeScript, and accessible Tailwind CSS design systems."
  },
  {
    title: "Core Programming",
    items: FOUNDER.expertise.programmingLanguages,
    icon: Code2,
    accent: "from-purple-500/20 to-pink-500/10",
    borderAccent: "group-hover:border-purple-500/40",
    description: "Foundational statically typed and systems languages utilized across the entire stack for deterministic, verifiable execution."
  },
  {
    title: "Cloud & Infrastructure",
    items: FOUNDER.expertise.databaseAndCloudInfrastructure,
    icon: Cloud,
    accent: "from-sky-500/20 to-cyan-500/10",
    borderAccent: "group-hover:border-sky-500/40",
    description: "Production CI/CD deployment pipelines, automated migration workflows, and zero-downtime cloud hosting architectures."
  },
  {
    title: "Network & Systems Topology",
    items: FOUNDER.expertise.networkAndSystems,
    icon: Network,
    accent: "from-teal-500/20 to-cyan-500/10",
    borderAccent: "group-hover:border-teal-500/40",
    description: "Physical routing boundaries, enterprise network configuration, and hardened security topologies for sovereign data workloads."
  }
];

export default function ExpertisePage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-white pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <BackButton fallbackHref="/about" label="Back to About" inline />
      </div>
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16 text-center z-10">
        <div className="inline-flex items-center gap-2 text-[#45D9D2] font-semibold tracking-widest uppercase text-xs mb-5 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10">
          <Cpu className="w-3.5 h-3.5" />
          Technical Capabilities & Stack
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.08] tracking-tight">
          Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white">Expertise</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Our engineering foundation is purpose-built to deliver production reliability — from low-level network topology and hardened relational databases to autonomous agent orchestration and voice intelligence.
        </p>
      </section>

      {/* Competency Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERTISE_DOMAINS.map((domain) => (
            <div 
              key={domain.title}
              className={`group p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-all duration-300 ${domain.borderAccent} relative overflow-hidden flex flex-col justify-between shadow-xl`}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <domain.icon className="w-6 h-6 text-[#45D9D2]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#45D9D2] transition-colors">
                  {domain.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {domain.description}
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Technologies & Frameworks</p>
                <ul className="flex flex-wrap gap-2">
                  {domain.items.map((item) => (
                    <li 
                      key={item}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#151922] border border-white/10 text-slate-200 group-hover:border-cyan-500/20 transition-colors"
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

      {/* Engineering Philosophy Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 mb-20">
        <div className="p-8 sm:p-10 rounded-2xl border border-white/10 bg-[#10131A] shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#45D9D2]">
              <ShieldCheck className="w-4 h-4" /> Production Standard
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Deterministic Software Engineering First
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We wrap probabilistic AI models with strictly typed, deterministic execution boundaries. Every system we build guarantees state integrity, observable logging, and zero unchecked hallucinations in business-critical workflows.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/about/founder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
              >
                <span>View Founder Credentials</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
              <Link
                href="/certifications"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-sm font-semibold text-[#45D9D2] transition-all"
              >
                <span>Verified Certifications</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FloatingElements />
      <CTASection
        title="Put this engineering capability to work"
        subtitle="Book a consultation with our systems architect or review our live production architectures."
        primaryCta={{ label: "Book a consultation", href: "/book-consultation" }}
        secondaryCta={{ label: "Explore services", href: "/services" }}
      />
    </div>
  );
}
