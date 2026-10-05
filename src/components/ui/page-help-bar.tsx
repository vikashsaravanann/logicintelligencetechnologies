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
  text = "Get in touch and we will point you to the right person.",
  primary = { label: "Contact us", href: "/contact" },
  secondary = { label: `Email ${COMPANY.email}`, href: `mailto:${COMPANY.email}` },
  className = "",
}: PageHelpBarProps) {
  const isMail = secondary.href.startsWith("mailto:");
  return (
    <section aria-label="Next steps" className={`mx-auto w-full max-w-4xl px-4 sm:px-6 py-12 ${className}`}>
      <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
          <Link
            href={primary.href}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-black transition-colors hover:bg-primary/90"
          >
            {primary.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={secondary.href}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:border-primary/60 hover:bg-white/10"
          >
            {isMail && <Mail className="h-4 w-4 shrink-0" aria-hidden />}
            <span className="break-all sm:break-normal">{isMail ? "Email us" : secondary.label}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
