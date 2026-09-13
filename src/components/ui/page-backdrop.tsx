/**
 * Full-bleed photo under page heroes. Overlay keeps type readable.
 * Decorative: empty alt.
 */
export default function PageBackdrop({
  src,
  className = "",
  position = "center",
}: {
  src: string;
  className?: string;
  position?: string;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
        decoding="async"
      />
      <div className="absolute inset-0 bg-[#0A0F1E]/74" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/40 via-[#0A0F1E]/62 to-[#0A0F1E]" />
    </div>
  );
}
