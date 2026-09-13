"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Approved Primary Initial Loading Experience for Logic Intelligence Technologies.
 *
 * Requirements satisfied:
 * 1. Single approved initial brand animation on initial session visit.
 * 2. Absolute removal of second loaders or duplicate splash screens.
 * 3. Immediate, seamless transition directly into the website with no intermediate blank screen.
 * 4. Respects `prefers-reduced-motion` and unmounts cleanly once finished.
 */
export default function InitialLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Only display once per browsing session to prevent repetitive interruptions
    try {
      const shown = sessionStorage.getItem("lit_initial_loaded");
      if (shown) {
        return;
      }
    } catch {
      // Fallback if sessionStorage is disabled/sandboxed
    }

    const handle = requestAnimationFrame(() => {
      setVisible(true);
    });

    const timer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("lit_initial_loaded", "true");
      } catch {
        // Safe fallback
      }
    }, 650);

    return () => {
      cancelAnimationFrame(handle);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="lit-initial-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0F1E] text-white pointer-events-none select-none"
          aria-hidden="true"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[280px] h-[280px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center">
            {/* LIT Brand Mark Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_25px_rgba(0,191,255,0.25)] bg-[#070b16] mb-5 p-1.5 flex items-center justify-center"
            >
              <Image
                src="/assets/logo-icon.webp"
                alt="Logic Intelligence Technologies"
                width={72}
                height={72}
                priority
                className="w-full h-full object-cover rounded-xl"
              />
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-center"
            >
              <h2 className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white font-mono">
                LOGIC INTELLIGENCE
              </h2>
              <p className="text-[10px] sm:text-[11px] font-medium tracking-widest text-cyan-400/80 mt-1 uppercase">
                Technologies
              </p>
            </motion.div>

            {/* Micro Progress Pulse Bar */}
            <div className="w-24 h-[2px] bg-white/10 rounded-full mt-5 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity }}
                className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
