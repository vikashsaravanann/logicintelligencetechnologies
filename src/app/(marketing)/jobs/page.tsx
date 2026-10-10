import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import JobsClient from "./jobs-client";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, faqPage, jobPostings, JOBS_FAQ } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Leadership Jobs — CEO and Directors | Logic Intelligence Technologies",
  description:
    "Join Logic Intelligence Technologies in Coimbatore. Open CEO and Director seats. Employment offers and letters of intent — not a partnership programme.",
};

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-white">
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
      <section className="relative min-h-[65vh] sm:min-h-[75vh] flex items-end overflow-hidden pt-28 pb-12 bg-[#07090D]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full" />
          <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-teal-500/10 blur-[150px] rounded-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/80 to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-950/40 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#45D9D2] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#45D9D2]">
              {COMPANY.displayName.toUpperCase()} · EXECUTIVE COHORT · 2026
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] max-w-4xl mb-6">
            OWN A FUNCTION.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white font-bold text-2xl sm:text-4xl lg:text-5xl mt-2 tracking-tight">
              Not a title you buy.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-8 font-normal">
            Four leadership seats are open next to the founder in Coimbatore. Bootstrapped studio shipping
            production web, mobile systems, and Logic AI. Modest cash until revenue. Real equity after the entity.
            If you need a cheque for a visiting card, this page is not for you.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-white/10">
            <div className="bg-[#10131A] backdrop-blur-md border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#45D9D2]">Seats Open</p>
              <p className="text-base sm:text-lg font-bold text-white mt-1">CEO + 3 Directors</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Operations, Eng, Sales, AI</p>
            </div>
            <div className="bg-[#10131A] backdrop-blur-md border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#45D9D2]">Headquarters</p>
              <p className="text-base sm:text-lg font-bold text-white mt-1">Coimbatore, TN</p>
              <p className="text-[11px] text-slate-400 mt-0.5">First 90 days in the room</p>
            </div>
            <div className="bg-[#10131A] backdrop-blur-md border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#45D9D2]">Leadership</p>
              <p className="text-base sm:text-lg font-bold text-white mt-1">Beside Founder</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct partnership with Vikash</p>
            </div>
            <div className="bg-[#10131A] backdrop-blur-md border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#45D9D2]">Governance</p>
              <p className="text-base sm:text-lg font-bold text-white mt-1">Letter of Intent</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Formal 6-month trial terms</p>
            </div>
          </div>
        </div>
      </section>
      <JobsClient />
    </div>
  );
}
