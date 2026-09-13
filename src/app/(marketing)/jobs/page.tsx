import { Metadata } from "next";
import Image from "next/image";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import JobsClient from "./jobs-client";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, faqPage, jobPostings, JOBS_FAQ } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Leadership Jobs — CEO and Directors",
  description:
    "Join Logic Intelligence Technologies in Coimbatore. Open CEO and Director seats. Employment offers and letters of intent — not a partnership programme.",
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white">
      <JsonLd
        data={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Jobs", path: "/jobs" },
          ]),
          faqPage(`${SITE}/jobs`, JOBS_FAQ),
          ...jobPostings(),
        ]}
      />
      <BackToHome />
      <section className="relative min-h-[72vh] sm:min-h-[82vh] flex items-end overflow-hidden pt-28">
        <Image
          src="/assets/jobs/studio-hero.jpg"
          alt="Logic Intelligence Technologies studio"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/80 to-[#0A0F1E]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12 sm:pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/40 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              {COMPANY.displayName.toUpperCase()} · EXECUTIVE COHORT · 2026
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] max-w-4xl mb-6 uppercase">
            Own a function.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-white font-black text-2xl sm:text-4xl lg:text-5xl mt-2 tracking-tight">
              Not a title you buy.
            </span>
          </h1>

          <p className="text-zinc-200 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 font-normal">
            Four leadership seats are open next to the founder. Bootstrapped studio shipping
            production web, mobile systems, and Logic AI. Modest cash until revenue. Real equity after the entity.
            If you need a cheque for a visiting card, this page is not for you.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-white/10">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/8 rounded-xl p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">Seats Open</p>
              <p className="text-base sm:text-lg font-black text-white mt-0.5">CEO + 3 Directors</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Operations, Eng, Sales, AI</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/8 rounded-xl p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">Headquarters</p>
              <p className="text-base sm:text-lg font-black text-white mt-0.5">Coimbatore, TN</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">First 90 days in the room</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/8 rounded-xl p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">Leadership</p>
              <p className="text-base sm:text-lg font-black text-white mt-0.5">Beside Founder</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Direct partnership with Vikash</p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/8 rounded-xl p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">Governance</p>
              <p className="text-base sm:text-lg font-black text-white mt-0.5">Letter of Intent</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Formal 6-month trial terms</p>
            </div>
          </div>
        </div>
      </section>
      <JobsClient />
    </main>
  );
}
