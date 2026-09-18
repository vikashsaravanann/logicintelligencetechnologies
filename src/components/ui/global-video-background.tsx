"use client";

const VIDEO = "/assets/backdrops/bg-vid-4.mp4";

export default function GlobalVideoBackground() {
  return (
    <div className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E]" aria-hidden>
      <video
        src={VIDEO}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-[#0A0F1E]/40 to-[#0A0F1E]/80" />
    </div>
  );
}
