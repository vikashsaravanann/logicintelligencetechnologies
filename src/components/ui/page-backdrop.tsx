"use client";

import Image from "next/image";

type PageBackdropProps = {
  /** Local path or remote URL (Unsplash allowed via next.config remotePatterns) */
  src?: string;
  /** Optional alt for accessibility; decorative by default */
  alt?: string;
  /** Darken overlay strength 0–100 (default 55) */
  overlayOpacity?: number;
  className?: string;
};

/**
 * Full-bleed photo under page heroes. Soft gradient overlay keeps type readable.
 * Accepts local `/assets/...` paths or remote https URLs.
 */
export default function PageBackdrop({
  src,
  alt = "",
  overlayOpacity = 55,
  className = "",
}: PageBackdropProps) {
  if (!src) return null;

  const isRemote = src.startsWith("http://") || src.startsWith("https://");
  const opacity = Math.min(100, Math.max(0, overlayOpacity)) / 100;

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={false}
        sizes="100vw"
        className="object-cover object-center scale-105"
        unoptimized={isRemote}
      />
      <div
        className="absolute inset-0 bg-slate-950"
        style={{ opacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
    </div>
  );
}
