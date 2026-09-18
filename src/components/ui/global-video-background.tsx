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

export default function GlobalVideoBackground() {
  const pathname = usePathname();

  const activeVideo = useMemo(() => {
    const path = pathname || "/";
    
    // Check if it's the home page, specifically force bg-vid-4 as requested earlier
    if (path === "/") return "/assets/backdrops/bg-vid-4.mp4";
    
    // Hash the pathname to pick a video 1-5 consistently for this specific page
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      hash = path.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % 5) + 1;
    return `/assets/backdrops/bg-vid-${index}.mp4`;
  }, [pathname]);

  return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E]" aria-hidden>
      {VIDEOS.map((videoSrc) => (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            videoSrc === activeVideo ? "opacity-60" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
    </div>
  );
}
