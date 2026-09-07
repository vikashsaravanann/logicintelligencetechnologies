import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import {
  ExternalLink,
  MapPin,
  GraduationCap,
  Sparkles,
  Code2,
  Award,
  Rocket,
  Mail,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Vikash's Portfolio | Founder Bio",
  description:
    "Vikash Saravanan — B.Tech AI & Data Science student, founder of Logic Intelligence Technologies. AI automation, full-stack web, and production software from Coimbatore.",
  openGraph: {
    title: "Vikash's Portfolio",
    description:
      "Personal portfolio of Vikash Saravanan — AI & Data Science, web development, founder of Logic Intelligence Technologies.",
    images: [{ url: COMPANY.founder.photoPath, width: 800, height: 800 }],
  },
};

const skills = [
  "Python",
  "React / Next.js",
  "TypeScript",
  "FastAPI",
  "PostgreSQL / Supabase",
  "LoRA / RAG",
  "n8n automation",
  "Prompt engineering",
  "Tailwind CSS",
  "Docker / CI",
];

const certs = [
  "Data Analysis — Microsoft & LinkedIn",
  "Coding Essentials — Scaler",
  "Full-Stack Development — Rathinam Workshop",
  "Data Analytics — LinkedIn",
  "Data Analysis with Python — freeCodeCamp",
  "Networking Basics — Cisco Academy",
  "Design Thinking — IIT Bombay",
  "Applied ML: Ensemble Learning — LinkedIn Learning",
  "Generative AI vs Traditional AI — LinkedIn Learning",
  "Hands-On Data Annotation — LinkedIn Learning",
  "Cybersecurity Threat Landscape — LinkedIn Learning",
];

const highlights = [
  {
    icon: Rocket,
    title: "Hackathon finalist",
    body: "Meta PyTorch (OpenEnv) — competing on practical ML systems, not slide decks.",
  },
  {
    icon: Code2,
    title: "Production architectures",
    body: "Multiple live web and AI systems shipped under Logic Intelligence Technologies.",
  },
  {
    icon: Award,
    title: "15+ certifications",
    body: "Data, full-stack, ML, and security foundations from Microsoft, LinkedIn, Cisco, and more.",
  },
  {
    icon: Sparkles,
    title: "AI automation focus",
    body: "Bridging advanced ML with full-stack product delivery — agents, RAG, and reliable APIs.",
  },
];

export default function VikashPortfolioPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 sm:pt-32 pb-20">
      <BackToHome />

      {/* Hero */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-start">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="w-48 h-56 sm:w-56 sm:h-64 rounded-3xl overflow-hidden border-2 border-primary/40 shadow-[0_0_40px_rgba(0,191,255,0.2)] bg-zinc-900">
              <img
                src={COMPANY.founder.photoPath}
                alt="Vikash Saravanan"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center bottom" }}
              />
            </div>
            <div className="text-center md:text-left space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Available for collaboration
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Vikash Saravanan
              </h1>
              <p className="text-sm text-zinc-400">
                Founder · AI &amp; Data Science · Full-Stack
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <a
                href={COMPANY.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-zinc-300 hover:border-primary/40 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> LinkedIn
              </a>
              <a
                href="https://github.com/vikashsaravanann"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-zinc-300 hover:border-primary/40 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> GitHub
              </a>
              <a
                href={`mailto:${COMPANY.emails.vikash}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-zinc-300 hover:border-primary/40 hover:text-white transition-colors"
              >
                <Mail className="w-3 h-3" /> Email
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-3">
                <GraduationCap className="w-4 h-4" />
                B.Tech AI &amp; Data Science
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-4">
                Building production AI and web systems from{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Coimbatore
                </span>
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                Ambitious AI &amp; Data Science undergraduate and founder of{" "}
                {COMPANY.displayName}. I specialize in bridging advanced machine
                learning with full-stack product architecture — autonomous agents,
                robust React/Next.js apps, and practical automation that ships.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Coimbatore, TN (Native: Karur)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                Open for remote &amp; Coimbatore roles
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((h) => (
                <div
                  key={h.title}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <h.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="font-bold text-white text-sm mb-1">{h.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto mt-16 sm:mt-20">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">About</h2>
        <div className="space-y-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
          <p>
            As a dedicated AI and full-stack engineer, I focus on high-impact
            delivery: scalable architectures, thoughtful UX, and AI features that
            solve real workflows — not demos that never leave the notebook.
          </p>
          <p>
            Through {COMPANY.displayName}, I work with businesses on websites,
            e-commerce, custom software, and applied AI (RAG assistants, automation,
            model workflows), with transparent pricing and a free demo when scope
            fits.
          </p>
          <p>
            Outside of product work you will often find me in hackathons, shipping
            open experiments, or refining prompt and agent systems for reliability
            in production.
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto mt-14">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Top skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/[0.04] text-zinc-300"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Certifications — not Developed Projects */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto mt-14">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Professional certifications
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {certs.map((c) => (
            <li
              key={c}
              className="text-sm text-zinc-400 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-8 max-w-6xl mx-auto mt-16">
        <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-6 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Let&apos;s build something real
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Internships, collaborations, or a product build with{" "}
            {COMPANY.displayName} — reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/free-demo"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-bold text-black bg-primary hover:brightness-110 transition-all"
            >
              Book a free demo
            </Link>
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-white/20 hover:bg-white/5"
            >
              <Phone className="w-4 h-4" /> {COMPANY.phone}
            </a>
          </div>
          <p className="mt-6 text-[11px] text-zinc-500">
            Personal site archive:{" "}
            <a
              href="https://vikashsaravanann.github.io/startupwithvikash/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              startupwithvikash
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
