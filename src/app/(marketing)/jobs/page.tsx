import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import { COMPANY } from "@/config/company";
import JobsClient from "./jobs-client";
import JsonLd from "@/components/seo/json-ld";
import CTASection from "@/components/ui/cta-section";
import { SITE, breadcrumb, faqPage, jobPostings, JOBS_FAQ } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Leadership Jobs — CEO and Directors | Logic Intelligence Technologies",
  description:
    "Join Logic Intelligence Technologies in Coimbatore. Open CEO and Director seats. Employment offers and letters of intent — not a partnership programme.",
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    title: "Leadership Jobs — CEO and Directors | Logic Intelligence Technologies",
    description:
      "Join Logic Intelligence Technologies in Coimbatore. Open CEO and Director seats next to the founder.",
    images: [
      {
        url: "/assets/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Leadership Jobs at Logic Intelligence Technologies",
      },
    ],
  },
};

export default function JobsPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
            { name: "Leadership Jobs", path: "/jobs" },
          ]),
          faqPage(`${SITE}/jobs`, JOBS_FAQ),
          ...jobPostings(),
        ]}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <BackButton fallbackHref="/careers" label="Careers" inline className="mb-6" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-blue,#1565C0)]/20 bg-[var(--lit-light-blue,#E7F3FF)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--lit-teal,#1FA9A2)] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--lit-blue,#1565C0)]">
              {COMPANY.displayName.toUpperCase()} · EXECUTIVE COHORT · 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] max-w-4xl mb-6 text-[var(--lit-navy,#0B2545)] font-poppins">
            OWN A FUNCTION.
            <span className="block font-serif italic text-2xl sm:text-4xl lg:text-5xl mt-2 tracking-tight text-[var(--lit-teal,#1FA9A2)] font-normal">
              Not a title you buy.
            </span>
          </h1>

          <p className="text-[var(--lit-text-muted,#52677C)] text-base sm:text-lg max-w-3xl leading-relaxed mb-10 font-normal">
            Four leadership seats are open next to the founder in Coimbatore. Bootstrapped studio shipping
            production web, mobile systems, and Logic AI. Modest cash until revenue. Real equity after the entity.
            If you need a cheque for a visiting card, this page is not for you.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-blue,#1565C0)]">Seats Open</p>
              <p className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mt-1">CEO + 3 Directors</p>
              <p className="text-[12px] text-[var(--lit-text-muted,#52677C)] mt-0.5">Operations, Eng, Sales, AI</p>
            </div>
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lit-teal,#1FA9A2)]">Headquarters</p>
              <p className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mt-1">Coimbatore, TN</p>
              <p className="text-[12px] text-[var(--lit-text-muted,#52677C)] mt-0.5">First 90 days in the room</p>
            </div>
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C3AED]">Leadership</p>
              <p className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mt-1">Beside Founder</p>
              <p className="text-[12px] text-[var(--lit-text-muted,#52677C)] mt-0.5">Direct partnership with Vikash</p>
            </div>
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B45309]">Governance</p>
              <p className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mt-1">Letter of Intent</p>
              <p className="text-[12px] text-[var(--lit-text-muted,#52677C)] mt-0.5">Formal 6-month trial terms</p>
            </div>
          </div>
        </div>

        {/* Interactive Leadership Cohort & Application Flow */}
        <JobsClient />

        {/* Canonical CTA */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
          <CTASection
            title="Have Questions Before Submitting?"
            subtitle="Connect directly with our engineering and leadership desk in Coimbatore to discuss architecture, roadmaps, or working terms."
            primaryCta={{
              label: "Schedule Founder Call",
              href: "/book",
            }}
            secondaryCta={{
              label: "Explore Engineering Stack",
              href: "/careers",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
