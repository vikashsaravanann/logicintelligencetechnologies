"use client";

import { usePathname } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeIndex = useMemo(() => {
    if (!pathname || pathname === "/") return 0;
    
    // Split the pages evenly across the 5 videos using a simple string hash
    let hash = 0;
    for (let i = 0; i < pathname.length; i++) {
      hash = pathname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 5;
  }, [pathname]);

  if (!mounted) return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E]" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E]" aria-hidden>
      <AnimatePresence mode="popLayout">
        <motion.video
          key={VIDEOS[activeIndex]}
          src={VIDEOS[activeIndex]}
          poster={POSTERS[activeIndex]}
          autoPlay
          muted
          loop
          playsInline
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
    </div>
  );
}
