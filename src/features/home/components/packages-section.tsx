"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { packagesData } from "@/data/packagesData";

/**
 * Packages grid — CSS-only reveal (no Framer whileInView) to keep INP low.
 * Heavy motion on scroll was blocking main-thread updates (~600ms+).
 */
export default function PackagesSection() {
  return (
    <section
      id="packages"
      className="py-16 md:py-24 bg-[#0A0F1E] relative border-t border-white/5"
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
            Our Service Packages
          </h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Transparent pricing. No hidden charges. Real value.
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {packagesData.map((pkg) => {
            const isPopular = pkg.slug === "business-pro-pack";
            return (
              <div
                key={pkg.slug}
                className={`relative rounded-3xl p-8 md:p-10 flex flex-col h-full bg-zinc-900/60 backdrop-blur-xl border transition-transform duration-200 will-change-transform hover:-translate-y-1 ${
                  isPopular
                    ? "lg:-mt-6 lg:mb-6 border-accent/50 shadow-[0_0_30px_rgba(123,47,190,0.15)]"
                    : "border-white/10"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-white bg-accent shadow-[0_0_15px_rgba(123,47,190,0.5)]">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-2xl font-black text-white mb-2">{pkg.title}</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl text-zinc-400">Starting from</span>
                  </div>
                  <div className="mb-6">
                    <span
                      className={`text-4xl font-black ${
                        isPopular
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
                          : "text-white"
                      }`}
                    >
                      {pkg.price}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-400 bg-black/50 p-3 rounded-lg border border-white/5">
                    <span className="text-zinc-300 font-bold block mb-1">Best for:</span>
                    {pkg.bestFor}
                  </p>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {pkg.inclusions.slice(0, 6).map((f) => (
                    <li
                      key={f.title}
                      className="flex gap-3 items-start text-sm text-zinc-300 leading-relaxed"
                    >
                      <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                      <span>{f.title}</span>
                    </li>
                  ))}
                  {pkg.inclusions.length > 6 && (
                    <li className="text-sm text-primary font-bold ml-8">
                      + {pkg.inclusions.length - 6} more features
                    </li>
                  )}
                </ul>

                <Link
                  href={`/packages/${pkg.slug}`}
                  className={`flex items-center justify-center w-full py-4 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    isPopular
                      ? "bg-accent text-white hover:bg-accent/90 shadow-[0_0_15px_rgba(123,47,190,0.4)]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  View Details
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto p-6 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-md">
          <p className="text-zinc-300 font-medium leading-relaxed">
            <span className="text-xl mr-2" aria-hidden>
              💡
            </span>
            Not sure which package fits you?{" "}
            <a
              href="https://wa.me/919342877474?text=Hi%20LIT%20—%20I%20need%20help%20choosing%20a%20package"
              className="inline-flex items-center gap-2 px-4 py-2 mx-1 rounded-xl bg-[#25D366] text-[#04120a] font-bold text-sm hover:bg-[#20bd5c] transition-colors cursor-pointer align-middle"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="w-3.5 h-3.5 fill-current"
                viewBox="0 0 448 512"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 415.2c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 186.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 17.6-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              WhatsApp us
            </a>{" "}
            and we&apos;ll recommend the right one for your business — for free.
          </p>
        </div>
      </div>
    </section>
  );
}
