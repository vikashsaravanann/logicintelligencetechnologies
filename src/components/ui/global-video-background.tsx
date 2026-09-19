"use client";

import { usePathname } from "next/navigation";
import { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Site-wide ambient video background.
 * - Full opacity (no 30% / 60% blend)
 * - Per-route video rotation across 5 backdrops
 * - Light navy scrim so white UI text stays readable
 * - Mobile: muted + playsInline for autoplay; respects reduced-motion
 */
const VIDEOS = [
  "/assets/backdrops/bg-vid-1.mp4",
  "/assets/backdrops/bg-vid-2.mp4",
  "/assets/backdrops/bg-vid-3.mp4",
  "/assets/backdrops/bg-vid-4.mp4",
  "/assets/backdrops/bg-vid-5.mp4",
];

const POSTERS = [
  "/bg-vid-1.mp4.jpg",
  "/bg-vid-2.mp4.jpg",
  "/bg-vid-3.mp4.jpg",
  "/bg-vid-4.mp4.jpg",
  "/bg-vid-5.mp4.jpg",
];

export default function GlobalVideoBackground() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const activeIndex = useMemo(() => {
    if (!pathname || pathname === "/") return 0;
    let hash = 0;
    for (let i = 0; i < pathname.length; i++) {
      hash = pathname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 5;
  }, [pathname]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    const play = () => {
      v.play().catch(() => {});
    };
    if (v.readyState >= 2) play();
    else v.addEventListener("loadeddata", play, { once: true });
  }, [reduced, activeIndex]);

  if (!mounted) {
    return (
      <div
        className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E] max-w-[100vw]"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E] max-w-[100vw]"
      aria-hidden
    >
      {!reduced && (
        <AnimatePresence mode="popLayout">
          <motion.video
            key={VIDEOS[activeIndex]}
            ref={videoRef}
            src={VIDEOS[activeIndex]}
            poster={POSTERS[activeIndex]}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{
              /* full strength — no blend; slight blur + brightness for type legibility */
              filter: "blur(4px) brightness(0.85)",
              WebkitFilter: "blur(4px) brightness(0.85)",
              transform: "scale(1.04)",
            }}
          />
        </AnimatePresence>
      )}

      {/* Light scrim only — video stays fully visible; text remains readable */}
      <div className="absolute inset-0 bg-[#0A0F1E]/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-transparent to-[#0A0F1E]/65" />
    </div>
  );
}
