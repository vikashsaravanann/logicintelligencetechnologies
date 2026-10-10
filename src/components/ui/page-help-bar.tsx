import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { COMPANY } from "@/config/company";

interface Action {
  label: string;
  href: string;
}

interface PageHelpBarProps {
  title?: string;
  text?: string;
  primary?: Action;
  secondary?: Action;
  className?: string;
}

/**
 * Compact closing action band for informational and legal pages, so no page
 * ends without a clear next step.
 */
export default function PageHelpBar({
  title = "Questions about this page?",
  text = "Get in touch and our team will provide guidance and immediate assistance.",
  primary = { label: "Contact Us", href: "/contact" },
  secondary = { label: `Email ${COMPANY.email}`, href: `mailto:${COMPANY.email}` },
  className = "",
}: PageHelpBarProps) {
  const isMail = secondary.href.startsWith("mailto:");
  return (
    <section aria-label="Next steps" className={`mx-auto w-full max-w-5xl px-4 sm:px-6 py-12 ${className}`}>
      <div className="flex flex-col gap-6 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 md:p-10 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">{title}</h2>
          <p className="mt-1.5 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
          <Link
            href={primary.href}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-[var(--lit-teal,#1FA9A2)] shadow-xs"
          >
            {primary.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={secondary.href}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-6 text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] transition-all hover:border-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-teal,#1FA9A2)] shadow-xs"
          >
            {isMail && <Mail className="h-4 w-4 shrink-0 text-[var(--lit-teal,#1FA9A2)]" aria-hidden />}
            <span className="break-all sm:break-normal">{isMail ? "Email Us" : secondary.label}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
