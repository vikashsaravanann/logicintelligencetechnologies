/**
 * Optional page hero photo under content.
 * Darker overlay so type stays sharp over ambient video + photo.
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
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        style={{ objectPosition: position }}
        decoding="async"
      />
      <div className="absolute inset-0 bg-[#0A0F1E]/78" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/50 via-[#0A0F1E]/70 to-[#0A0F1E]" />
    </div>
  );
}
