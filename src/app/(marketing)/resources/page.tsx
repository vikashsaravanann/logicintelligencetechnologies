import { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { PDF_RESOURCES } from "@/config/pdfs";
import { BookOpen, MessageSquare, Sparkles, UserCheck, FileText, DownloadCloud } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import CTASection from "@/components/ui/cta-section";
import ResourcesFilterableGrid from "./components/ResourcesFilterableGrid";

export const metadata: Metadata = {
  title: "Engineering Resources, Guides & Architecture Whitepapers | Logic Intelligence Technologies",
  description: "Enterprise technical guides, architecture checklists, business automation playbooks, and corporate capability profiles.",
  alternates: {
    canonical: "/resources",
  },
  openGraph: {
    title: "Resources & Downloads | Logic Intelligence Technologies",
    description: "Enterprise guides, technical checklists, AI readiness frameworks, and project templates from Logic Intelligence Technologies.",
    images: [{ url: "/api/og?title=Technical+Resources+%26+Whitepapers&category=Executive+Briefs", width: 1200, height: 630, alt: "LIT Resources" }],
  },
};

const STEPS = [
  {
    step: "01",
    Icon: UserCheck,
    title: "Verify Account Credentials",
    description: "Sign in or register with your professional email to authenticate access to restricted architectural documentation.",
    badge: "Step 1",
  },
  {
    step: "02",
    Icon: FileText,
    title: "Select Document & Review Scope",
    description: "Inspect architectural blueprints, compliance matrices, implementation timelines, and security guidelines.",
    badge: "Step 2",
  },
  {
    step: "03",
    Icon: DownloadCloud,
    title: "Instant Download & Inbox Backup",
    description: "Download commences automatically in high-definition PDF format, with a verified backup link dispatched to your inbox.",
    badge: "Step 3",
  },
];

export default function ResourcesPage() {
  return (
    <PageShell>
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <JsonLd
          data={breadcrumb([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
          ])}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Home" inline />
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive &amp; Technical Knowledge Hub</span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Resources, Frameworks &amp; Technical Briefs
            </h1>

            <p className="font-serif italic text-lg sm:text-xl text-[var(--lit-teal,#1FA9A2)] max-w-2xl mx-auto">
              Authoritative whitepapers, enterprise architecture checklists, and production playbooks.
            </p>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto font-light">
              Directly verified architectural documentation, engineering blueprints, and executive briefs. Free for signed-in members: choose any document for secure PDF access.
            </p>

            {/* Hero Quick Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <a
                href="#library"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-all"
              >
                <BookOpen className="h-4 w-4 text-cyan-300" aria-hidden />
                <span>Browse Documents</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] hover:border-[#1565C0]/40 hover:bg-slate-50 transition-all shadow-sm"
              >
                <MessageSquare className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" aria-hidden />
                <span>Request Custom Brief</span>
              </Link>
            </div>

            {/* 3-Step Process Guide */}
            <div className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {STEPS.map((s) => {
                  const StepIcon = s.Icon;
                  return (
                    <div
                      key={s.step}
                      className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 shadow-sm space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-sm">
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[var(--lit-teal,#1FA9A2)] uppercase px-2 py-0.5 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                          {s.badge}
                        </span>
                      </div>
                      <h3 className="font-poppins text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filterable Resource Grid */}
          <ResourcesFilterableGrid resources={PDF_RESOURCES} />

          {/* Canonical Enterprise CTA */}
          <div className="mt-20">
            <CTASection
              title="Need Custom Technical Architecture or Private Briefs?"
              subtitle="Our principal engineers conduct bespoke technical feasibility reviews, data privacy assessments, and system design sessions for enterprise teams."
              primaryCta={{
                label: "Book Technical Consultation",
                href: "/book-consultation",
              }}
              secondaryCta={{
                label: "Explore Case Studies",
                href: "/case-studies",
              }}
            />
          </div>
        </div>
      </main>
    </PageShell>
  );
}
