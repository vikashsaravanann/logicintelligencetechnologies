import Link from 'next/link';
import { ArrowRight, ExternalLink, MessageSquare } from 'lucide-react';
import { COMPANY } from '@/config/company';

const HEALTHCARE_URL = 'https://healthcare.logicintelligencetechnologies.in';
const ORG_STORE_URL = `${HEALTHCARE_URL}/organization-store`;

export default function HealthcareCTA() {
  return (
    <section aria-label="Healthcare call to action" className="bg-white px-3 py-6 sm:px-5 sm:py-8 md:px-7 md:py-10">
      <div className="w-full overflow-hidden rounded-[2rem] border border-[#ddd7ed] bg-gradient-to-br from-[#f1eafb] via-[#efedf8] to-[#e8f3fc] px-6 py-12 text-center sm:px-10 sm:py-16 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <span className="mb-6 inline-flex rounded-full border border-[#9bd8f5]/60 bg-white/55 px-5 py-2 text-xs font-semibold uppercase tracking-[.18em] text-[#284e68]">
            Healthcare OS
          </span>
          <h2 className="mx-auto mb-6 max-w-5xl break-words text-[clamp(2.1rem,5vw,4.5rem)] font-bold leading-[1.04] tracking-[-.045em] text-[#171827]">
            Bring Healthcare to <span className="font-serif font-normal italic text-[#3b7ea5]">Your Organization</span>
          </h2>
          <p className="mx-auto mb-9 max-w-4xl text-base leading-relaxed text-[#39445a] sm:text-lg md:text-xl">
            Explore the live platform, review subscription tiers and module options, or reach out to discuss custom integration with the Healthcare team.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href={HEALTHCARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#9bd8f5] px-7 py-3.5 text-sm font-semibold text-[#12324a] shadow-sm transition hover:bg-[#83caee] sm:w-auto"
            >
              Explore Healthcare Platform
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
            <Link
              href="/healthcare/plans"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#111827] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#263247] sm:w-auto"
            >
              View Healthcare Plans
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-[#33445a] sm:flex-row sm:gap-7">
            <a href={ORG_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline decoration-[#9bd8f5] underline-offset-4 hover:text-[#173d59]">
              Organization Store <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            <Link href="/contact" className="inline-flex items-center gap-2 underline decoration-[#9bd8f5] underline-offset-4 hover:text-[#173d59]">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden /> Request a Discussion
            </Link>
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-sm leading-relaxed text-[#56647a]">
            For enterprise deployments, custom hospital configurations, or multi-branch inquiries, contact us at{' '}
            <a href={`mailto:${COMPANY.email}`} className="font-semibold text-[#2c769e] underline underline-offset-4">{COMPANY.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
