import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FreeDemoCTA() {
  return (
    <section className="relative overflow-hidden bg-white px-3 py-6 sm:px-5 sm:py-8 md:px-7 md:py-10">
      <div className="w-full text-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-[#ddd7ed] bg-gradient-to-br from-[#f1eafb] via-[#efedf8] to-[#e8f3fc] px-6 py-14 sm:px-10 sm:py-16 md:px-16 md:py-20">
          <h2 className="mx-auto mb-6 max-w-6xl break-words text-[clamp(2.1rem,5.4vw,4.75rem)] font-bold leading-[1.04] tracking-[-.045em] text-[#171827]">
            Ready to Build Your System?
          </h2>

          <p className="mx-auto mb-8 max-w-4xl text-base leading-relaxed text-[#39445a] sm:text-lg md:text-xl">
            Explore our transparent pricing tiers or request a zero-obligation working prototype.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/packages"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#263247] sm:w-auto"
            >
              <span>View Packages</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/free-demo"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#222b3a]/25 bg-white/50 px-6 py-3 text-sm font-semibold text-[#1b2435] transition hover:bg-white/80 sm:w-auto"
            >
              Request Free Demo
            </Link>
          </div>
          <Link className="mt-5 inline-flex text-sm font-medium text-[#39445a] underline decoration-[#9bd8f5] underline-offset-4 hover:text-[#171827]" href="/book-consultation">
            Book a technical consultation
          </Link>
        </div>
      </div>
    </section>
  );
}
