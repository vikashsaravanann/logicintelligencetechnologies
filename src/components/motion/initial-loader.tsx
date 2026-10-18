"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * First-paint brand loader only (not used for every soft navigation —
 * RouteTransitionHost handles those so pages never feel stuck).
 */
export default function InitialLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    const started = performance.now();
    const MIN_MS = 280;
    const MAX_MS = 900;

    const hide = () => {
      const elapsed = performance.now() - started;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(() => setVisible(false), wait);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    const hardCap = window.setTimeout(() => setVisible(false), MAX_MS);
    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(hardCap);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="lit-universal-page-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050608] text-white pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="relative flex max-w-full flex-col items-center px-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#070b16] p-1.5 shadow-[0_0_24px_rgba(6,182,212,0.18)] sm:h-20 sm:w-20"
            >
              <Image
                src="/assets/logo-icon.webp"
                alt="Logic Intelligence Technologies"
                width={72}
                height={72}
                priority
                className="h-full w-full rounded-xl object-cover"
              />
            </motion.div>
            <h2 className="whitespace-nowrap text-center font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white min-[360px]:text-[11px] min-[360px]:tracking-[0.16em] sm:text-xs sm:tracking-[0.2em] md:text-sm">
              LOGIC INTELLIGENCE TECHNOLOGIES
            </h2>
            <div className="relative mt-5 h-[2px] w-24 overflow-hidden rounded-full bg-white/10">
              <div className="lit-loader-bar h-full w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
