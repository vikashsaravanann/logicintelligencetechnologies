"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

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

  const activeIndex = useMemo(() => {
    if (!pathname || pathname === "/") return 0;
    
    // Split the pages evenly across the 5 videos using a simple string hash
    let hash = 0;
    for (let i = 0; i < pathname.length; i++) {
      hash = pathname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 5;
  }, [pathname]);

  return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E]" aria-hidden>
      {VIDEOS.map((video, index) => (
        <video
          key={video}
          src={video}
          poster={POSTERS[index]}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-60" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
    </div>
  );
}
