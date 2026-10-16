"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Universal Page Loading Animation for Logic Intelligence Technologies.
 *
 * Requirements satisfied:
 * 1. Plays on initial load of ANY page across the platform.
 * 2. Triggers on every page navigation / route transition so all pages have the identical opening loading experience.
 * 3. Exact visual match: Deep dark background, glowing LIT brand mark, uppercase monospace title, and animated cyan pulse bar.
 * 4. Respects `prefers-reduced-motion` and unmounts cleanly with seamless fade-out.
 */
export default function InitialLoader() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const isFirstMount = useRef(true);
  const isNavigatingRef = useRef(false);
  const navStartTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSingleLoader = (duration = 450) => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

    setVisible(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, duration);
  };

  const startNavigationLoader = () => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    isNavigatingRef.current = true;
    navStartTimeRef.current = Date.now();
    setVisible(true);

    // Safety timeout to dismiss loader in case navigation hangs
    safetyTimerRef.current = setTimeout(() => {
      setVisible(false);
      isNavigatingRef.current = false;
    }, 3500);
  };

  // Trigger on initial page mount (plays once when opening the site)
  useEffect(() => {
    triggerSingleLoader(550);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  // Listen for route transition completion: dismiss navigation loader cleanly
  useEffect(() => {
    // Skip initial mount (handled by mount effect)
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (isNavigatingRef.current) {
      // Navigation completed! Ensure a smooth minimum duration so fast loads don't flash, then dismiss.
      const elapsed = Date.now() - navStartTimeRef.current;
      const minDuration = 320;
      const remaining = Math.max(0, minDuration - elapsed);

      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setVisible(false);
        isNavigatingRef.current = false;
      }, remaining);
    } else {
      // Navigation happened without link click (e.g. browser history back/forward or router.push)
      // Run single brief transition
      triggerSingleLoader(380);
    }
  }, [pathname]);

  // Proactive link click listener: trigger immediately when user clicks internal navigation links
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      // Ignore modifier clicks (open in new tab / window) or non-left clicks
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      // Ignore external links, mailto, tel, downloads, or target="_blank"
      if (
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        target.href.startsWith("mailto:") ||
        target.href.startsWith("tel:") ||
        target.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      try {
        const url = new URL(target.href);
        const currentUrl = new URL(window.location.href);

        // Must be same origin (domain)
        if (url.origin !== currentUrl.origin) {
          return;
        }

        // Ignore clicks to the exact same page and query
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        // Start single navigation load transition
        startNavigationLoader();
      } catch {
        // Safe fallback
      }
    };

    document.addEventListener("click", handleLinkClick, { passive: true });
    return () => {
      document.removeEventListener("click", handleLinkClick);
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
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050608] text-white pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center px-4 max-w-full">
            {/* LIT Brand Mark Container with subtle cyan glow */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#070b16] mb-5 p-1.5 flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.18)]"
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

            {/* Brand Title: single unbreakable line across desktop, tablet, and mobile */}
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.25 }}
              className="text-center w-full flex justify-center"
            >
              <h2 className="text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.12em] min-[360px]:tracking-[0.16em] sm:tracking-[0.2em] uppercase text-white font-mono whitespace-nowrap">
                LOGIC INTELLIGENCE TECHNOLOGIES
              </h2>
            </motion.div>

            {/* Micro Progress Pulse Bar */}
            <div className="w-24 h-[2px] bg-white/10 rounded-full mt-5 overflow-hidden relative">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent lit-loader-bar" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
