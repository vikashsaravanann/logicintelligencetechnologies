import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, FileText, Download, Code, Cloud, Key, Lock, Mail } from "lucide-react";
import { getPaymentRequestByToken } from "@/lib/payments/db";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Stage 12: Project Handover & Delivery | Logic Intelligence Technologies",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function HandoverPage({ params }: Props) {
  const { token } = await params;
  const paymentData = token ? await getPaymentRequestByToken(token) : null;
  const projectTitle = paymentData?.proposal?.title || "Enterprise Engagement Deliverables";

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--lit-navy,#0B2545)] to-[var(--lit-blue,#1565C0)] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              L
            </div>
            <div>
              <span className="font-poppins font-extrabold text-base sm:text-lg text-[var(--lit-navy,#0B2545)] tracking-tight block leading-tight">
                LOGIC INTELLIGENCE TECHNOLOGIES
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
                STAGE 12 · HANDOVER & ASSET TRANSFER
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Final Settlement Confirmed</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-8 sm:p-12 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[var(--lit-teal,#1FA9A2)] to-[var(--lit-navy,#0B2545)]" />

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              STAGE 12 · FINAL HANDOVER & SIGN-OFF
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Project Handover & Deliverable Sign-Off
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
            Welcome to the final delivery stage for <strong className="text-[var(--lit-navy,#0B2545)]">{projectTitle}</strong>.
            Your final payment has been reconciled. All production repositories, cloud environments, and intellectual property
            are prepared for transfer to your organization.
          </p>

          {/* Deliverables Transfer Checklist */}
          <div className="mt-8 pt-8 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-4">
              Handover Deliverables Checklist
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
                <Code className="h-5 w-5 text-[var(--lit-blue,#1565C0)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-[var(--lit-navy,#0B2545)] block">
                    Source Code Repositories
                  </strong>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                    Git organization transfer, full commit history, tagged release v1.0.0.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
                <Cloud className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-[var(--lit-navy,#0B2545)] block">
                    Cloud Infrastructure Transfer
                  </strong>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                    GCP / AWS project ownership, Terraform state transfer, IAM role handover.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
                <Key className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-[var(--lit-navy,#0B2545)] block">
                    API Credentials & Secrets Vault
                  </strong>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                    End-to-end secret rotation and encrypted export to your team.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-start gap-3">
                <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-[var(--lit-navy,#0B2545)] block">
                    Architecture Runbooks & Docs
                  </strong>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                    System diagrams, deployment playbooks, operations manual, and SLAs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="mt-8 pt-8 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/client/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--lit-navy,#0B2545)] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#123663] transition-all"
            >
              <span>Access Client Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="mailto:hello@logicintelligencetechnologies.in?subject=Stage%2012%20Handover%20Inquiry"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--lit-ink,#121826)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Engineering Lead</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
