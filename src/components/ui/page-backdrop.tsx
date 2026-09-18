"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

/**
 * Full-bleed photo under page heroes. Overlay keeps type readable.
 * Automatically selects one of 5 video loops based on the page route.
 */
export default function PageBackdrop({
  src,
  videoSrc,
  className = "",
  position = "center",
}: {
  src?: string;
  videoSrc?: string;
  className?: string;
  position?: string;
}) {
  const pathname = usePathname();

  const activeVideo = useMemo(() => {
    if (videoSrc) return videoSrc;
    if (!pathname) return "/assets/backdrops/bg-vid-1.mp4";
    
    // Simple hash to consistently assign one of 5 videos based on the route
    let hash = 0;
    for (let i = 0; i < pathname.length; i++) {
      hash = pathname.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % 5) + 1;
    return `/assets/backdrops/bg-vid-${index}.mp4`;
  }, [pathname, videoSrc]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {activeVideo ? (
        <video
          key={activeVideo} // forces reload if video changes
          src={activeVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
          decoding="async"
        />
      ) : null}
      <div className="absolute inset-0 bg-[#0A0F1E]/74" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/40 via-[#0A0F1E]/62 to-[#0A0F1E]" />
    </div>
  );
}
