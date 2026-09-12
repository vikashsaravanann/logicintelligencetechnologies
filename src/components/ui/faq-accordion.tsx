"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FAQAccordion({
  items,
  title = "Frequently Asked Questions",
  subtitle = "Clear answers to technical, commercial, and delivery questions.",
  className = "",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  };

  return (
    <div className={`py-12 ${className}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Answers</span>
          </div>
          {title && <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">{title}</h3>}
          {subtitle && <p className="text-sm sm:text-base text-zinc-400">{subtitle}</p>}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/20"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-base text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-zinc-300 leading-relaxed border-t border-white/5">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
