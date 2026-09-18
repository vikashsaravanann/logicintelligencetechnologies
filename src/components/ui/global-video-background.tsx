"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function GlobalVideoBackground() {
  const pathname = usePathname();

  const activeVideo = useMemo(() => {
    if (!pathname) return "/assets/backdrops/bg-vid-1.mp4";
    
    // Check if it's the home page, specifically force bg-vid-2 as requested earlier
    if (pathname === "/") return "/assets/backdrops/bg-vid-2.mp4";
    
    // Hash the pathname to pick a video 1-5 consistently for this specific page
    let hash = 0;
    for (let i = 0; i < pathname.length; i++) {
      hash = pathname.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % 5) + 1;
    return `/assets/backdrops/bg-vid-${index}.mp4`;
  }, [pathname]);

  return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none" aria-hidden>
      <video
        key={activeVideo} // forces reload if video changes
        src={activeVideo}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-[#0A0F1E]/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
    </div>
  );
}
