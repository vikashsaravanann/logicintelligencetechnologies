"use client";

import { useState, useEffect } from "react";
import { ArrowUp, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function FloatingElements() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) {
      const t = window.setTimeout(() => setShowCookie(true), 2000);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowTopBtn(window.scrollY > 400);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowCookie(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const presence = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 12 },
      };

  return (
    <>
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            {...presence}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-24 left-6 z-50 p-3 bg-[rgba(69,217,210,0.1)] border border-primary/50 rounded-full text-primary hover:bg-primary hover:text-black  transition-colors cursor-pointer"
            aria-label="Back to top"
            type="button"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCookie && (
          <motion.div
            {...presence}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            <p className="text-sm text-zinc-300">
              We use cookies to improve your experience and deliver personalized services.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={acceptCookies}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-black hover:bg-primary/90 cursor-pointer"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setShowCookie(false)}
                className="p-2 text-zinc-500 hover:text-white cursor-pointer"
                aria-label="Dismiss cookie notice"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
