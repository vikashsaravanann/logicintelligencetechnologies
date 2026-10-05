"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const FAQS = [
  {
    q: "What is VoiceShield?",
    a: "VoiceShield is an AI-powered voice security product by Logic Intelligence Technologies. It detects AI-generated synthetic voices and voice clones in real time using the AASIST deep learning anti-spoofing model, protecting telephony systems from voice fraud.",
  },
  {
    q: "How does real-time detection work?",
    a: "Your browser captures microphone audio via the Web Audio API. An AudioWorklet converts it to 16-bit PCM at 16 kHz, chunks it into 333ms segments, and streams them over a WebSocket to the VoiceShield FastAPI backend. The AASIST model runs inference on each chunk and returns a spoof probability score. This loop is entirely deterministic — no large language model is involved.",
  },
  {
    q: "Is my audio stored?",
    a: "By default, STORE_RAW_AUDIO=false. Audio chunks are processed in memory and discarded immediately after inference. Detection scores and session metadata are stored, not raw audio. This default can be verified in the VoiceShield backend configuration.",
  },
  {
    q: "What is AASIST?",
    a: "AASIST stands for Audio Anti-Spoofing using Integrated Spectro-Temporal graph attention networks. It is a deep learning architecture designed specifically for the ASVspoof challenge (a benchmark for anti-spoofing systems). VoiceShield loads AASIST as a TorchScript model for fast CPU/GPU inference.",
  },
  {
    q: "What are the risk levels?",
    a: "VoiceShield classifies each audio chunk into three risk levels: Low (spoof probability < 0.3) → monitor; Medium (0.3–0.7) → challenge; High (≥ 0.7) → block. These thresholds are configurable in the decision engine.",
  },
  {
    q: "Can VoiceShield analyse recorded files?",
    a: "Yes. The forensic analysis endpoint accepts uploaded audio files, segments them into chunks, scores each slice with the AASIST model, detects splice regions where risk level changes abruptly, and generates a full forensic report including an AI-generated XAI summary.",
  },
  {
    q: "Is the live demo available right now?",
    a: "The live demo requires the VoiceShield FastAPI backend to be deployed and configured. If the backend URL is not yet configured (FASTAPI_INFERENCE_URL), the demo page will show the configuration status clearly and provide a contact path to request a demo session.",
  },
  {
    q: "How is VoiceShield related to Logic Intelligence Technologies?",
    a: "VoiceShield is an AI security product developed and maintained by Logic Intelligence Technologies. It is not a separately incorporated company — it is a proprietary technology offering under the LIT brand.",
  },
  {
    q: "What performance benchmarks have been independently verified?",
    a: "At this time, performance metrics (latency, detection accuracy, EER) are design targets based on the AASIST research paper and internal testing. Independent third-party benchmarks have not yet been published. We will update this section when independent results are available.",
  },
  {
    q: "How can I request a demo or integration?",
    a: "Use the 'Request a Demo' form on this page. Our team at Logic Intelligence Technologies will contact you to schedule a demonstration and discuss your integration requirements.",
  },
] as const;

function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQS)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassSurface variant="card" className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 rounded-2xl"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-bold text-white leading-snug pr-2">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-white/[0.06]">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassSurface>
  );
}

export default function VoiceShieldFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-24 px-6 relative bg-[rgba(5,10,25,0.6)]"
      aria-labelledby="vs-faq-heading"
    >
      <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Frequently Asked Questions
          </span>
        </div>

        <motion.h2
          id="vs-faq-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-extrabold text-white mb-12 tracking-tight"
        >
          Common questions
        </motion.h2>

        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <FAQItem
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
